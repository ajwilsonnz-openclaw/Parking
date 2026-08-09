import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getUserFromRequest } from '@/lib/auth';
import { getRpId, RP_NAME, storeChallenge, b64urlToBuf } from '@/lib/auth/webauthn';
import { getPasskeysByUser } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/** POST /api/auth/passkeys/register-options */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rpID = getRpId(req);

  const existing = await getPasskeysByUser(user.id);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: user.email,
    userDisplayName: user.name,
    // v13 expects a base64url string for userID
    userID: new TextEncoder().encode(user.id) as any,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    excludeCredentials: existing.map((c) => ({
      // v13: id is a base64url string (or Buffer that will be converted), transports optional
      id: b64urlToBuf(c.credential_id) as any,
      transports: c.transports ? (JSON.parse(c.transports) as any) : undefined,
    })),
  });

  const challengeId = `chl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await storeChallenge({ id: challengeId, kind: 'reg', user_id: user.id, challenge: options.challenge });

  return NextResponse.json({ options, challengeId });
}
