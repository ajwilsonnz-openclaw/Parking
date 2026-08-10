import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { execDb } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const user = await requireManagement();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  await execDb('UPDATE parking_sessions SET boot_requested = 1 WHERE id = ? AND is_active = 1', [sessionId]);
  return NextResponse.json({ success: true });
}
