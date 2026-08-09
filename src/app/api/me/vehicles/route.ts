import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

/** GET /api/me/vehicles */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await queryDb('SELECT * FROM unit_vehicles WHERE user_id = ? ORDER BY requested_at DESC', [user.id]);
  return NextResponse.json({ vehicles: rows });
}

/** POST /api/me/vehicles - request a new vehicle registration (goes pending) */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plate_number, make_model_color } = await req.json();
  if (!plate_number) return NextResponse.json({ error: 'Plate required' }, { status: 400 });

  // Check for duplicate
  const existing = await queryDb(
    'SELECT id FROM unit_vehicles WHERE user_id = ? AND plate_number = ?',
    [user.id, plate_number.toUpperCase()]
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: 'This plate is already registered' }, { status: 409 });
  }

  const id = `veh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await execDb(
      'INSERT INTO unit_vehicles (id, user_id, unit_number, plate_number, make_model_color, status) VALUES (?,?,?,?,?,?)',
      [id, user.id, user.unit_number, plate_number.toUpperCase(), make_model_color || null, 'pending']
    );
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
