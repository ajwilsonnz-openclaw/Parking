import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { queryDbOne, execDb } from '@/lib/db';
import { addNotification } from '@/lib/auth';

export const runtime = 'edge';

/** POST /api/mgmt/boot-request — flag a resident-excess session for immediate vacate */
export async function POST(req: NextRequest) {
  const user = await requireManagement(req);
  if (user instanceof NextResponse) return user;

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const session = await queryDbOne<any>('SELECT * FROM parking_sessions WHERE id = ? AND is_active = 1', [sessionId]);
  if (!session) return NextResponse.json({ error: 'Session not found or inactive' }, { status: 404 });

  try {
    await execDb('UPDATE parking_sessions SET boot_requested = 1 WHERE id = ?', [sessionId]);
    // Notify the session owner
    const ownerUser = session.user_id;
    await addNotification(
      ownerUser,
      'Priority Vacate Required',
      `Please move your vehicle from spot ${session.spot_number} as visitor space is needed.`
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
