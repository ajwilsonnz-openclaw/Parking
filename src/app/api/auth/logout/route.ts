import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken, deleteSession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const token = getSessionToken(req);
  if (token) {
    try {
      await deleteSession(token);
    } catch (e) {
      console.error('logout error:', e);
    }
  }
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
