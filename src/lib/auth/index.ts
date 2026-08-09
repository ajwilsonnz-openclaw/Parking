// Auth utilities: session cookie, OTP magic-link, role guards.
// Works on both Cloudflare Edge (D1) and local better-sqlite3 via lib/db.

import { NextRequest, NextResponse } from 'next/server';
import { queryDbOne, queryDb, execDb } from '@/lib/db';
import type { User } from '@/types';

const SESSION_COOKIE = 'mvp_session';
const SESSION_DAYS = 30;

// ─── Crypto helpers ──────────────────────────────────────
function arrayBufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  return bytes.buffer as ArrayBuffer;
}

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  return arrayBufferToHex(await crypto.subtle.digest('SHA-256', enc));
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return arrayBufferToHex(bytes.buffer as ArrayBuffer);
}

function randomOtpCode(): string {
  return Math.floor(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000).toString();
}

// ─── Cookie plumbing ──────────────────────────────────────
export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookieVal = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
  response.headers.append('Set-Cookie', cookieVal);
}

export function clearSessionCookie(response: NextResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookieVal = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  response.headers.append('Set-Cookie', cookieVal);
}

export function getSessionToken(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

// ─── Session persistence ─────────────────────────────────
export async function createAuthSession(userId: string, userAgent?: string) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const id = `as-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  try {
    await execDb(
      'INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, user_agent) VALUES (?,?,?,?,?)',
      [id, userId, tokenHash, expiresAt.toISOString(), userAgent || '']
    );
  } catch (e) {
    console.error('createAuthSession error:', e);
  }
  return { token, expiresAt };
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = getSessionToken(req);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await queryDbOne<{
    user_id: string;
    expires_at: string;
    email: string;
    name: string;
    unit_number: string;
    phone: string;
    role: string;
    status: string;
  }>(
    `SELECT s.user_id, s.expires_at, u.email, u.name, u.unit_number, u.phone, u.role, u.status
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    [tokenHash]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  if (row.status !== 'active') return null;
  return {
    id: row.user_id,
    email: row.email,
    name: row.name,
    unit_number: row.unit_number,
    phone: row.phone,
    role: row.role as any,
    status: row.status as any,
    created_at: '',
  };
}

export async function deleteSession(token: string) {
  const tokenHash = await sha256(token);
  try {
    await execDb('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash]);
  } catch (e) {
    console.error('deleteSession error:', e);
  }
}

// ─── Magic Link / OTP ─────────────────────────────────────
export async function createOtp(email: string): Promise<string> {
  const code = randomOtpCode();
  const id = `otp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  try {
    // Clean up old OTPs for this email
    await execDb('DELETE FROM otp_codes WHERE email = ? OR expires_at < ?', [email, new Date().toISOString()]);
    await execDb('INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?,?,?,?)', [
      id,
      email,
      code,
      expiresAt.toISOString(),
    ]);
  } catch (e) {
    console.error('createOtp error:', e);
  }
  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const row = await queryDbOne<{ attempts: number; expires_at: string; used: number }>(
    'SELECT attempts, expires_at, used FROM otp_codes WHERE email = ? AND code = ?',
    [email, code]
  );
  if (!row) return false;
  if (row.used === 1) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  if (row.attempts >= 5) return false;

  // Burn the code (one-time use)
  try {
    await execDb('UPDATE otp_codes SET used = 1, attempts = attempts + 1 WHERE email = ? AND code = ?', [email, code]);
  } catch (e) {}
  return true;
}

// ─── User lookup / creation ───────────────────────────────
export async function findUserByEmail(email: string): Promise<User | null> {
  const row = await queryDbOne<any>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND status = ?',
    [email, 'active']
  );
  if (!row) return null;
  return row as User;
}

export async function getWhitelistEntry(email: string): Promise<any | null> {
  return queryDbOne('SELECT * FROM whitelist WHERE LOWER(email) = LOWER(?)', [email]);
}

/** Consume a whitelist entry, creating the user on first use */
export async function createUserFromWhitelist(entry: {
  email: string;
  name: string;
  unit_number: string;
  phone: string;
  role: string;
}): Promise<User | null> {
  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await execDb(
      'INSERT INTO users (id, email, name, unit_number, phone, role) VALUES (?,?,?,?,?,?)',
      [id, entry.email, entry.name, entry.unit_number, entry.phone, entry.role]
    );
    return {
      id,
      email: entry.email,
      name: entry.name,
      unit_number: entry.unit_number,
      phone: entry.phone,
      role: entry.role as any,
      status: 'active',
      created_at: new Date().toISOString(),
    };
  } catch (e) {
    console.error('createUserFromWhitelist error:', e);
    // Might exist already (race). Fetch existing user.
    return findUserByEmail(entry.email);
  }
}

// ─── Notification helper ──────────────────────────────────
export async function addNotification(userId: string, title: string, body: string, link?: string) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await execDb('INSERT INTO notifications (id, user_id, title, body, link) VALUES (?,?,?,?,?)', [
      id, userId, title, body, link,
    ]);
  } catch (e) {
    console.error('addNotification error:', e);
  }
}

// ─── Role guards ──────────────────────────────────────────
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
