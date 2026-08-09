import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOtp,
  findUserByEmail,
  getWhitelistEntry,
  createUserFromWhitelist,
  createAuthSession,
  setSessionCookie,
} from '@/lib/auth';

export const runtime = 'edge';

/**
 * POST /api/auth/verify
 * Body: { email, code }
 * Verifies OTP, creates/loads user, sets session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();
    const ok = await verifyOtp(normalized, String(code).trim());
    if (!ok) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Existing user or new from whitelist
    let user = await findUserByEmail(normalized);
    if (!user) {
      const wl = await getWhitelistEntry(normalized);
      if (!wl) return NextResponse.json({ error: 'Not whitelisted' }, { status: 403 });
      user = await createUserFromWhitelist(wl);
    }
    if (!user) return NextResponse.json({ error: 'User creation failed' }, { status: 500 });

    const { token, expiresAt } = await createAuthSession(user.id, req.headers.get('user-agent') || '');
    const res = NextResponse.json({ success: true, user });
    setSessionCookie(res, token, expiresAt);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
