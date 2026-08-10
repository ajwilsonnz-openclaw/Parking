import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireUser } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

// ─── Admin: batches for building settings ────────────────
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await queryDb('SELECT * FROM system_config');
  const config: Record<string, string> = {};
  rows.forEach((row: any) => { config[row.key] = row.value; });
  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updates = await req.json();
  for (const [key, value] of Object.entries(updates)) {
    if (!['complex_name', 'complex_address', 'max_visitor_hours', 'max_resident_excess_hours', 'demerit_fine_threshold', 'demerit_fine_amount', 'max_weekly_rental_price', 'total_visitor_parks', 'spot_prefix', 'tow_agency_name', 'tow_agency_phone'].includes(key)) continue;
    await execDb(
      'INSERT INTO system_config (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, String(value)]
    );
  }

  return NextResponse.json({ success: true });
}
