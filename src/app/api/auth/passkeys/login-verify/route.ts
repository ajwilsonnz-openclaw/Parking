import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { getRpId, getOrigin, consumeChallenge, getPasskeyByCredentialId, updatePasskeyCounter, b64urlToBuf } from '@/lib/auth/webauthn';
import { queryDbOne } from '@/lib/db';
import { createAuthSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

/** POST /api/auth/passkeys/login-verify */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { challengeId, assertion } = body;
  if (!challengeId || !assertion) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  const challenge = await consumeChallenge(challengeId);
  if (!challenge || challenge.kind !== 'auth') {
    return NextResponse.json({ error: 'Challenge mismatch' }, { status: 400 });
  }

  const credentialId = assertion.id; // base64url string
  const stored = await getPasskeyByCredentialId(credentialId);
  if (!stored) return NextResponse.json({ error: 'Unknown passkey' }, { status: 404 });

  const user = await queryDbOne<any>(
    "SELECT * FROM users WHERE id = ? AND status = 'active'",
    [stored.user_id]
  );
  if (!user) return NextResponse.json({ error: 'Account disabled or missing' }, { status: 403 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpId(req),
      requireUserVerification: false,
      credential: {
        id: stored.credential_id,
        publicKey: new Uint8Array(b64urlToBuf(stored.public_key)),
        counter: stored.counter,
        transports: stored.transports ? (JSON.parse(stored.transports) as any) : undefined,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Verification failed' }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const newCounter = verification.authenticationInfo.newCounter;
  await updatePasskeyCounter(
    stored.credential_id,
    Math.max(stored.counter ?? 0, newCounter ?? 0)
  );

  const { token, expiresAt } = await createAuthSession(user.id, req.headers.get('user-agent') || '');
  const res = NextResponse.json({ success: true, user });
  setSessionCookie(res, token, expiresAt);
  return res;
}
