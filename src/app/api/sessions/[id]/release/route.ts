import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queryDbOne, execDb } from '@/lib/db';
import { addNotification } from '@/lib/auth';

export const runtime = 'edge';

/** POST /api/sessions/:id/release - end a session early */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sessionId = params.id;
    const session = await queryDbOne<any>(
      'SELECT * FROM parking_sessions WHERE id = ? AND is_active = 1',
      [sessionId]
    );
    if (!session) return NextResponse.json({ error: 'Session not found or already ended' }, { status: 404 });

    // Only the owner or management/admin can release
    const isOwner = session.user_id === user.id;
    const isManager = user.role === 'management' || user.role === 'admin';
    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await execDb('UPDATE parking_sessions SET is_active = 0, end_time = ? WHERE id = ?', [
      new Date().toISOString(),
      sessionId,
    ]);
    await execDb('UPDATE carparks SET status = ? WHERE id = ?', ['available', session.carpark_id]);

    await addNotification(user.id, 'Spot Released', `Session for ${session.spot_number} has been ended.`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('release error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
