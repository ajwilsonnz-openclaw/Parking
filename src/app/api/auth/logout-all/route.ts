import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, destroyAllUserSessions, clearSessionCookie } from '@/lib/auth';
import { deleteAllPasskeysForUser } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/**
 * POST /api/auth/logout-all — sign out every device for the current account.
 * Wipes all D1 sessions and deletes all passkeys.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await destroyAllUserSessions(user.id);
    await deleteAllPasskeysForUser(user.id);
  } catch (e) {
    console.error('logout-all error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
