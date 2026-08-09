import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken, destroySession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

/** POST /api/auth/logout — clear the D1 resident session cookie (Clerk handles their side independently) */
export async function POST(req: NextRequest) {
  const token = getSessionToken(req);
  if (token) {
    try { await destroySession(token); } catch (e) { console.error(e); }
  }
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
