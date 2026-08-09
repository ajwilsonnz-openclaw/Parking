import { NextRequest, NextResponse } from 'next/server';
import { queryDbOne, execDb } from '@/lib/db';
import { destroyAllUserSessions } from '@/lib/auth';
import { deleteAllPasskeysForUser } from '@/lib/auth/webauthn';

export const runtime = 'edge';

/**
 * POST /api/webhooks/clerk
 * Clerk → us. Standard Webhooks (svix) signature verification, no extra dependency.
 * Keeps our D1 store consistent with Clerk when accounts are deleted.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  const body = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (secret) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 401 });
    }
    try {
      await verifySvixSignatureSvix(secret, svixId, svixTimestamp, body, svixSignature);
    } catch (e: any) {
      console.error('Webhook signature verification failed:', e.message);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }
  } else {
    console.warn('CLERK_WEBHOOK_SIGNING_SECRET not set — skipping signature verification (development).');
  }

  let event: any;
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }); }

  const type = event?.type;
  const data = event?.data;

  try {
    switch (type) {
      case 'user.deleted': {
        const email: string | undefined = data?.email_addresses?.[0]?.email_address;
        if (!email) break;
        const normalized = email.trim().toLowerCase();
        const user = await queryDbOne<{ id: string }>(
          'SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [normalized]
        );
        if (user) {
          await execDb("UPDATE users SET status = 'disabled' WHERE id = ?", [user.id]);
          await destroyAllUserSessions(user.id);
          await deleteAllPasskeysForUser(user.id);
        }
        break;
      }
      case 'session.removed': {
        // Suicide: a Clerk session was removed — no action needed; we own our session lifecycle.
        break;
      }
      default:
        break;
    }
  } catch (e: any) {
    console.error('Webhook processing error:', e);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Svix verification (hand-rolled, Edge-safe) ───────────
async function verifySvixSignatureSvix(
  secret: string, svixId: string, svixTimestamp: string, body: string, signatureHeader: string
): Promise<void> {
  const ts = parseInt(svixTimestamp, 10) * 1000;
  if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) throw new Error('Timestamp too old');

  const keyB64 = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const keyBytes = Uint8Array.from(atob(keyB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const toSign = `${svixId}.${svixTimestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(toSign));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  const candidates = signatureHeader.split(' ').map((part) => (part.startsWith('v1,') ? part.slice(3) : part));
  for (const cand of candidates) {
    if (cand === expectedB64) return;
  }
  throw new Error('Signature mismatch');
}
