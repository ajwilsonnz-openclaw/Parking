import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { queryDbOne, execDb } from '@/lib/db';
import type { User } from '@/types';

// ─── User identity ────────────────────────────────────────────
export async function getUserFromClerk(): Promise<User | null> {
  try {
    const { userId } = await auth();
    console.log('[getUserFromClerk] auth() userId:', userId);
    if (!userId) return null;

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
      ?? clerkUser.emailAddresses[0]?.emailAddress;
    console.log('[getUserFromClerk] resolved email:', email);
    if (!email) return null;
    const normalized = email.trim().toLowerCase();

    const isOwnerAdmin = normalized === 'ajwilsonnz@gmail.com' || normalized.startsWith('admin@');
    const clerkRole = (clerkUser.publicMetadata as any)?.role;
    let initialRole = isOwnerAdmin ? 'admin' : 'user';
    if (clerkRole && ['user', 'management', 'admin'].includes(clerkRole)) {
      initialRole = clerkRole;
    }

    const fallbackUser: User = {
      id: `usr-${userId.slice(-8)}`,
      email: normalized,
      name: clerkUser.fullName || (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : normalized.split('@')[0]),
      unit_number: isOwnerAdmin ? 'Body Corp HQ' : 'Unassigned',
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
      role: initialRole as any,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    try {
      const whitelistEntry = await queryDbOne<any>('SELECT * FROM whitelist WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);
      if (whitelistEntry?.role) {
        fallbackUser.role = whitelistEntry.role;
        if (whitelistEntry.name) fallbackUser.name = whitelistEntry.name;
        if (whitelistEntry.unit_number) fallbackUser.unit_number = whitelistEntry.unit_number;
        if (whitelistEntry.phone) fallbackUser.phone = whitelistEntry.phone;
      }

      let user = await queryDbOne<any>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);
      if (!user) {
        await execDb(
          'INSERT INTO users (id, email, name, unit_number, phone, role, status) VALUES (?,?,?,?,?,?,?)',
          [fallbackUser.id, normalized, fallbackUser.name, fallbackUser.unit_number, fallbackUser.phone, fallbackUser.role, 'active']
        ).catch(() => {});
      } else {
        fallbackUser.id = user.id;
        if (user.unit_number && user.unit_number !== 'Unassigned') fallbackUser.unit_number = user.unit_number;
        if (isOwnerAdmin && user.role !== 'admin') {
          await execDb('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]).catch(() => {});
          fallbackUser.role = 'admin';
        } else if (user.role) {
          fallbackUser.role = user.role;
        }
        if (user.status === 'suspended') return null;
      }
    } catch (dbErr) {
      console.warn('[getUserFromClerk] D1 sync warning (using Clerk fallback identity):', dbErr);
    }

    return fallbackUser;
  } catch (e) {
    console.error('getUserFromClerk error:', e);
    return null;
  }
}

// ─── Auth guards ───────────────────────────────────────────────
export async function requireUser(): Promise<User | null> {
  return getUserFromClerk();
}

export async function requireManagement(): Promise<User | null> {
  const user = await getUserFromClerk();
  if (!user) return null;
  if (user.role !== 'management' && user.role !== 'admin') return null;
  return user;
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getUserFromClerk();
  if (!user) return null;
  if (user.role !== 'admin') return null;
  return user;
}

// ─── Error helper (for backwards compat during refactor) ────────
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof Error) {
    // map known error classes
    if (err.name === 'HttpError') {
      return NextResponse.json({ error: err.message }, { status: (err as any).status ?? 500 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
