import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDbOne, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only release own session, unless manager/admin
  const session = await queryDbOne<{ user_id: string; carpark_id: string }>(
    'SELECT user_id, carpark_id FROM parking_sessions WHERE id = ? AND is_active = 1',
    [params.id]
  );
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const isOwner = session.user_id === user.id;
  const isManager = user.role === 'management' || user.role === 'admin';
  if (!isOwner && !isManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await execDb('UPDATE parking_sessions SET is_active = 0, end_time = datetime("now") WHERE id = ?', [params.id]);
  await execDb('UPDATE carparks SET status = ? WHERE id = ?', ['available', session.carpark_id]);

  return NextResponse.json({ success: true });
}
