import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Ensure table exists on D1
  await execDb(`
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      unit_number TEXT UNIQUE NOT NULL,
      assigned_parks INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  const rows = await queryDb('SELECT * FROM units ORDER BY unit_number ASC');
  return NextResponse.json({ units: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { unit_number, assigned_parks, notes } = await req.json();
  if (!unit_number) return NextResponse.json({ error: 'Unit number required' }, { status: 400 });

  const cleanUnit = String(unit_number).trim();
  const parksNum = parseInt(assigned_parks) || 1;

  // Ensure table exists
  await execDb(`
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      unit_number TEXT UNIQUE NOT NULL,
      assigned_parks INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  const existing = await queryDb('SELECT id FROM units WHERE unit_number = ?', [cleanUnit]);
  if (existing.length > 0) {
    await execDb('UPDATE units SET assigned_parks = ?, notes = ? WHERE unit_number = ?', [parksNum, notes || null, cleanUnit]);
  } else {
    const id = `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await execDb(
      'INSERT INTO units (id, unit_number, assigned_parks, notes) VALUES (?,?,?,?)',
      [id, cleanUnit, parksNum, notes || null]
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM units WHERE id = ? OR unit_number = ?', [id, id]);
  return NextResponse.json({ success: true });
}
