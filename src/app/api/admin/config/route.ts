import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await queryDb('SELECT * FROM system_config');
  const config: Record<string, string> = {};
  rows.forEach((row: any) => { config[row.key] = row.value; });
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates = await req.json();
  for (const [key, value] of Object.entries(updates)) {
    if (!value && value !== 0) continue;
    await execDb(
      'INSERT INTO system_config (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, String(value)]
    ).catch(async () => {
      await execDb('DELETE FROM system_config WHERE key = ?', [key]);
      await execDb('INSERT INTO system_config (key, value) VALUES (?,?)', [key, String(value)]);
    });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
