import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await queryDb('SELECT * FROM saved_guests WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
  return NextResponse.json({ savedGuests: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone, plate, make_model_color } = await req.json();
  if (!name || !plate) return NextResponse.json({ error: 'Name and plate are required' }, { status: 400 });

  const id = `sg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await execDb(
    'INSERT INTO saved_guests (id, user_id, name, phone, plate, make_model_color) VALUES (?,?,?,?,?,?)',
    [id, user.id, name, phone || null, plate.toUpperCase(), make_model_color || null]
  );
  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM saved_guests WHERE id = ? AND user_id = ?', [id, user.id]);
  return NextResponse.json({ success: true });
}
