import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

/** GET /api/admin/config */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const rows = await queryDb('SELECT * FROM system_config');
  const config: Record<string, string> = {};
  rows.forEach((row: any) => { config[row.key] = row.value; });
  return NextResponse.json({ config });
}

/** PATCH /api/admin/config */
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const updates = await req.json();
  // Validate keys are known
  const allowed = [
    'complex_name', 'complex_address',
    'max_visitor_hours', 'max_resident_excess_hours',
    'demerit_fine_threshold', 'demerit_fine_amount',
    'max_weekly_rental_price',
    'total_visitor_parks', 'spot_prefix',
    'tow_agency_name', 'tow_agency_phone',
  ];

  try {
    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      await execDb(
        'INSERT INTO system_config (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, String(value)]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
