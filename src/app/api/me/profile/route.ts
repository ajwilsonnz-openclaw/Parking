import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { execDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, phone, unit_number } = body;

  const cleanName = name ? String(name).trim() : user.name;
  const cleanPhone = phone !== undefined ? (phone ? String(phone).trim() : null) : user.phone;
  const cleanUnit = unit_number ? String(unit_number).trim() : user.unit_number;

  await execDb(
    'UPDATE users SET name = ?, phone = ?, unit_number = ? WHERE id = ?',
    [cleanName, cleanPhone, cleanUnit, user.id]
  );

  await execDb(
    'UPDATE whitelist SET name = ?, phone = ?, unit_number = ? WHERE email = ?',
    [cleanName, cleanPhone, cleanUnit, user.email]
  );

  return NextResponse.json({ success: true });
}
