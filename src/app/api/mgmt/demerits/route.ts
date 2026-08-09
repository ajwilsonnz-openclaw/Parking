import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { queryDbOne, execDb } from '@/lib/db';

export const runtime = 'edge';

/** POST /api/mgmt/demerits - issue a demerit to a unit */
export async function POST(req: NextRequest) {
  const user = await requireManagement(req);
  if (user instanceof NextResponse) return user;

  const { unit_number, vehicle_plate, spot_number, violation_type, description, demerit_points } = await req.json();

  if (!unit_number || !vehicle_plate || !spot_number || !violation_type || demerit_points == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Calculate current demerit total for the unit
  const totalRow = await queryDbOne<{ total: number | null }>(
    `SELECT COALESCE(SUM(demerit_points), 0) as total FROM demerits WHERE unit_number = ? AND status = 'issued'`,
    [unit_number]
  );
  const currentTotal = totalRow?.total || 0;
  const newTotal = currentTotal + demerit_points;

  // Get config to check threshold
  const thresholdRow = await queryDbOne<{ value: string }>(`SELECT value FROM system_config WHERE key = 'demerit_fine_threshold'`);
  const fineAmountRow = await queryDbOne<{ value: string }>(`SELECT value FROM system_config WHERE key = 'demerit_fine_amount'`);
  const threshold = parseInt(thresholdRow?.value || '3', 10);
  const fineAmount = newTotal >= threshold ? parseFloat(fineAmountRow?.value || '50') : 0;

  const id = `dem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await execDb(
      `INSERT INTO demerits
        (id, unit_number, vehicle_plate, spot_number, violation_type, description, demerit_points, fine_amount, issued_by_user_id)
        VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, unit_number, vehicle_plate, spot_number, violation_type, description || '', demerit_points, fineAmount, user.id]
    );
    return NextResponse.json({ success: true, id, triggered_fine: fineAmount > 0, fine_amount: fineAmount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
