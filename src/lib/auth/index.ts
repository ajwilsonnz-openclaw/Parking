// Auth utilities: session cookie, role guards, WebAuthn scaffolding.
// Works on Cloudflare Edge (D1) and local better-sqlite3 via lib/db.

import { NextRequest, NextResponse } from 'next/server';
import { queryDbOne, execDb } from '@/lib/db';
import type { User } from '@/types';

const SESSION_COOKIE = 'mvp_session';
const SESSION_DAYS = 30;

// ─── Crypto helpers (Edge-friendly) ──────────────────────
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)));
}

function randomToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer);
}

function randomId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Session cookie plumbing ─────────────────────────────
export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`
  );
}

export function clearSessionCookie(res: NextResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

export function getSessionToken(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

// ─── Sessions in D1 ──────────────────────────────────────
export async function createAuthSession(userId: string, userAgent?: string) {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await execDb(
    'INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, user_agent) VALUES (?,?,?,?,?)',
    [randomId('as'), userId, tokenHash, expiresAt.toISOString(), userAgent || '']
  );
  return { token, expiresAt };
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = getSessionToken(req);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await queryDbOne<any>(
    `SELECT s.expires_at, u.*
     FROM auth_sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    [tokenHash]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  if (row.status !== 'active') return null;
  // Sliding renewal: touch last_seen
  execDb("UPDATE auth_sessions SET last_seen_at = datetime('now') WHERE token_hash = ?", [tokenHash]).catch(() => {});
  const { expires_at, ...user } = row;
  return user as User;
}

export async function destroySession(token: string): Promise<void> {
  try {
    const tokenHash = await sha256Hex(token);
    await execDb('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash]);
  } catch {}
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  try { await execDb('DELETE FROM auth_sessions WHERE user_id = ?', [userId]); } catch {}
}

// ─── User + whitelist helpers ────────────────────────────
export async function findUserByEmail(email: string): Promise<User | null> {
  return queryDbOne<User>(
    "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND status = 'active'",
    [email]
  );
}

export async function getWhitelistEntry(email: string) {
  return queryDbOne<any>('SELECT * FROM whitelist WHERE LOWER(email) = LOWER(?)', [email]);
}

export async function createUserFromWhitelist(entry: {
  email: string; name: string; unit_number: string; phone?: string; role: string;
}): Promise<User | null> {
  const id = randomId('usr');
  try {
    await execDb(
      'INSERT INTO users (id, email, name, unit_number, phone, role) VALUES (?,?,?,?,?,?)',
      [id, entry.email, entry.name, entry.unit_number, entry.phone ?? null, entry.role]
    );
    return (await findUserByEmail(entry.email)) || null;
  } catch (e) {
    console.error('createUserFromWhitelist error:', e);
    return findUserByEmail(entry.email);
  }
}

// ─── Notifications ───────────────────────────────────────
export async function addNotification(userId: string, title: string, body: string, link?: string): Promise<void> {
  try {
    await execDb('INSERT INTO notifications (id, user_id, title, body, link) VALUES (?,?,?,?,?)',
      [randomId('notif'), userId, title, body, link ?? null]);
  } catch (e) { console.error('addNotification error:', e); }
}

// ─── Role guards ─────────────────────────────────────────
export async function requireUser(req: NextRequest): Promise<User | NextResponse> {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return user;
}

export async function requireManagement(req: NextRequest): Promise<User | NextResponse> {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'management' && user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden - management only' }, { status: 403 });
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<User | NextResponse> {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
  return user;
}
