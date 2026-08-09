import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { getWhitelistEntry, findUserByEmail, createUserFromWhitelist, createAuthSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

/**
 * POST /api/auth/clerk-sync
 * Authorization: Bearer <clerk session token> (via useAuth().getToken())
 *
 * Takes the verified Clerk identity and “hands off” to our own D1 resident session.
 * After this returns, we instruct Clerk to kill its session so no persistent
 * Clerk session remains on the device (we're now using our own D1 session).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!bearer) return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });

  let clerkUserId: string;
  try {
    const payload = await verifyToken(bearer, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    clerkUserId = payload.sub as string;
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid Clerk token: ' + e.message }, { status: 401 });
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  let emailAddress: string | undefined;
  let clerkUser: any;
  try {
    clerkUser = await clerk.users.getUser(clerkUserId);
    emailAddress = clerkUser.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
      || clerkUser.emailAddresses?.[0]?.emailAddress;
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch user from Clerk: ' + e.message }, { status: 500 });
  }
  if (!emailAddress) return NextResponse.json({ error: 'No email on Clerk account' }, { status: 400 });

  // Enforce invite-only whitelist against our D1 table (we are source of truth for roles)
  const normalized = emailAddress.trim().toLowerCase();
  const whitelistEntry = await getWhitelistEntry(normalized);
  if (!whitelistEntry) {
    return NextResponse.json(
      { error: 'Your email has not been whitelisted by the building management.' },
      { status: 403 }
    );
  }

  // Load or create our D1 user
  let user = await findUserByEmail(normalized);
  if (!user) {
    user = await createUserFromWhitelist({
      email: normalized,
      name: whitelistEntry.name,
      unit_number: whitelistEntry.unit_number,
      phone: whitelistEntry.phone,
      role: whitelistEntry.role,
    });
  }
  if (!user) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });

  // Create our own session cookie
  const { token, expiresAt } = await createAuthSession(user.id, req.headers.get('user-agent') || '');

  const res = NextResponse.json({ success: true, user });
  setSessionCookie(res, token, expiresAt);
  return res;
}
