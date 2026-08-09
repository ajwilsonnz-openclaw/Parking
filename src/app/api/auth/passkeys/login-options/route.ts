import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getRpId, storeChallenge } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/** POST /api/auth/passkeys/login-options — discoverable-credential login */
export async function POST(req: NextRequest) {
  // No email filter — allows the authenticator to pick any credential registered for this RP.
  const options = await generateAuthenticationOptions({
    rpID: getRpId(req),
    userVerification: 'preferred',
  });

  const challengeId = `chl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await storeChallenge({ id: challengeId, kind: 'auth', challenge: options.challenge });

  return NextResponse.json({ options, challengeId });
}
