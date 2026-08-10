import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { execDb } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const user = await requireManagement();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { unit_number, vehicle_plate, spot_number, violation_type, description, demerit_points } = await req.json();
  if (!unit_number || !vehicle_plate || !spot_number) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const id = `dem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await execDb(
    `INSERT INTO demerits (id, unit_number, vehicle_plate, spot_number, violation_type, description, demerit_points, fine_amount, issued_by_user_id)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, unit_number, vehicle_plate, spot_number, violation_type, description || '', demerit_points, 0, null]
  );

  return NextResponse.json({ success: true, id });
}
