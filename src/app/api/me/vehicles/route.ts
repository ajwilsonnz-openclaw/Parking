import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await queryDb(
    'SELECT * FROM unit_vehicles WHERE user_id = ? OR unit_number = ? ORDER BY requested_at DESC',
    [user.id, user.unit_number]
  );
  return NextResponse.json({ vehicles: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plate_number, make_model_color } = await req.json();
  if (!plate_number) return NextResponse.json({ error: 'Plate required' }, { status: 400 });

  const cleanPlate = plate_number.trim().toUpperCase();
  const existing = await queryDb(
    'SELECT id FROM unit_vehicles WHERE (user_id = ? OR unit_number = ?) AND plate_number = ?',
    [user.id, user.unit_number, cleanPlate]
  );
  if (existing.length > 0) return NextResponse.json({ error: 'Already registered' }, { status: 409 });

  const id = `veh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await execDb(
    "INSERT INTO unit_vehicles (id, user_id, unit_number, plate_number, make_model_color, status) VALUES (?,?,?,?,?,?)",
    [id, user.id, user.unit_number, cleanPlate, make_model_color || null, 'approved']
  );
  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM unit_vehicles WHERE id = ? AND (user_id = ? OR unit_number = ?)', [id, user.id, user.unit_number]);
  return NextResponse.json({ success: true });
}
