import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await queryDb('SELECT * FROM whitelist ORDER BY added_at DESC LIMIT 500');
  return NextResponse.json({ whitelist: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, name, unit_number, phone, role } = await req.json();
  if (!email || !unit_number) return NextResponse.json({ error: 'Email and unit required' }, { status: 400 });

  const normalized = String(email).trim().toLowerCase();
  const existing = await queryDb('SELECT id FROM whitelist WHERE LOWER(email) = LOWER(?)', [normalized]);
  if (existing.length > 0) return NextResponse.json({ error: 'Email already whitelisted' }, { status: 409 });

  const id = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await execDb(
    'INSERT INTO whitelist (id, email, name, unit_number, phone, role, added_by_user_id) VALUES (?,?,?,?,?,?,?)',
    [id, normalized, name || normalized.split('@')[0], unit_number, phone || null, role || 'user', user.id]
  );
  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM whitelist WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
