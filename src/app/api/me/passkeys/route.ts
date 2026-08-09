import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getPasskeysByUser, deletePasskeyForUser } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/** GET /api/me/passkeys — list my registered passkeys */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await getPasskeysByUser(user.id);
  return NextResponse.json({ passkeys: rows.map((p: any) => ({
    id: p.id,
    device_label: p.device_label,
    platform: p.platform,
    created_at: p.created_at,
    last_used_at: p.last_used_at,
  })) });
}

/** POST /api/me/passkeys — add a passkey (body: { deviceLabel }) → calls register-options flow */
export async function POST(req: NextRequest) {
  // Purely convenience — registration is handled by /register-options + /register-verify.
  return NextResponse.json({ error: 'Use /api/auth/passkeys/register-options' }, { status: 400 });
}

/** DELETE /api/me/passkeys?id=... */
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await deletePasskeyForUser(id, user.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
