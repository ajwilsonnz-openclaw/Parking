import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getUserFromRequest, addNotification } from '@/lib/auth';
import { getRpId, getOrigin, consumeChallenge, savePasskey, b64urlToBuf, bufToB64url } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/** POST /api/auth/passkeys/register-verify */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { challengeId, attestation, deviceLabel } = body;
  if (!challengeId || !attestation) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  const challenge = await consumeChallenge(challengeId);
  if (!challenge || challenge.kind !== 'reg' || challenge.user_id !== user.id) {
    return NextResponse.json({ error: 'Challenge mismatch' }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpId(req),
      requireUserVerification: false,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Verification failed' }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Passkey registration not verified' }, { status: 400 });
  }

  const info = verification.registrationInfo;

  const rawCredId = info.credential.id;
  const credIdB64url = typeof rawCredId === 'string'
    ? rawCredId
    : bufToB64url(new Uint8Array(rawCredId));

  const rawPubKey = info.credential.publicKey as Uint8Array;
  const pubKeyB64url = bufToB64url(rawPubKey);

  await savePasskey({
    id: `pk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    user_id: user.id,
    credential_id: credIdB64url,
    public_key: pubKeyB64url,
    counter: info.credential.counter,
    transports: attestation.response?.transports ? JSON.stringify(attestation.response.transports) : null,
    device_label: deviceLabel || null,
    platform: req.headers.get('user-agent')?.slice(0, 120) || null,
    aaguid: (info as any).aaguid || null,
  });

  await addNotification(
    user.id,
    'FaceID / biometric sign-in enabled',
    'You can now unlock Millennium Village Parking with this device.'
  );

  return NextResponse.json({ success: true });
}
