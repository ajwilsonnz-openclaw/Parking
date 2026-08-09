// WebAuthn helpers: request-context RP/Origin, challenge store, SmallWebAuthn edge glue
import { NextRequest } from 'next/server';
import { queryDb, queryDbOne, execDb } from '@/lib/db';

export function getRpId(req: NextRequest): string {
  return new URL(req.url).hostname;
}

export function getOrigin(req: NextRequest): string {
  return new URL(req.url).origin;
}

export const RP_NAME = 'Millennium Village Parking';
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

// ─── Base64url helpers ──────────────────────────────────
export function bufToB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlToBuf(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + '='.repeat(padLen);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

// ─── Challenge storage ──────────────────────────────────
export async function storeChallenge(opts: {
  id: string;
  kind: 'reg' | 'auth';
  user_id?: string | null;
  email?: string | null;
  challenge: string;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();
  await execDb(
    'INSERT INTO auth_challenges (id, kind, user_id, email, challenge, expires_at) VALUES (?,?,?,?,?,?)',
    [opts.id, opts.kind, opts.user_id ?? null, opts.email ?? null, opts.challenge, expiresAt]
  );
}

export async function consumeChallenge(id: string): Promise<{
  kind: string;
  user_id: string | null;
  email: string | null;
  challenge: string;
} | null> {
  const row = await queryDbOne<any>(
    'SELECT kind, user_id, email, challenge, expires_at, used FROM auth_challenges WHERE id = ?',
    [id]
  );
  if (!row) return null;
  if (row.used === 1) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await execDb('UPDATE auth_challenges SET used = 1 WHERE id = ?', [id]);
  return { kind: row.kind, user_id: row.user_id, email: row.email, challenge: row.challenge };
}

// ─── Passkey records ────────────────────────────────────
export async function getPasskeysByUser(userId: string) {
  return queryDb<any>('SELECT * FROM passkey_credentials WHERE user_id = ? ORDER BY created_at ASC', [userId]);
}

export async function getPasskeyByCredentialId(credentialId: string) {
  return queryDbOne<any>('SELECT * FROM passkey_credentials WHERE credential_id = ?', [credentialId]);
}

export async function savePasskey(cred: {
  id: string;
  user_id: string;
  credential_id: string; // base64url
  public_key: string;    // base64url
  counter: number;
  transports?: string | null;
  device_label?: string | null;
  platform?: string | null;
  aaguid?: string | null;
}): Promise<void> {
  await execDb(
    `INSERT INTO passkey_credentials (id, user_id, credential_id, public_key, counter, transports, device_label, platform, aaguid)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [cred.id, cred.user_id, cred.credential_id, cred.public_key, cred.counter, cred.transports ?? null, cred.device_label ?? null, cred.platform ?? null, cred.aaguid ?? null]
  );
}

export async function updatePasskeyCounter(credentialId: string, counter: number): Promise<void> {
  await execDb("UPDATE passkey_credentials SET counter = ?, last_used_at = datetime('now') WHERE credential_id = ?",
    [counter, credentialId]);
}

export async function deletePasskeyForUser(id: string, userId: string): Promise<void> {
  await execDb('DELETE FROM passkey_credentials WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function deleteAllPasskeysForUser(userId: string): Promise<void> {
  await execDb('DELETE FROM passkey_credentials WHERE user_id = ?', [userId]);
}

// ─── Housekeeping ───────────────────────────────────────
export async function purgeStaleChallenges(): Promise<void> {
  try { await execDb("DELETE FROM auth_challenges WHERE expires_at < datetime('now')"); } catch {}
}
