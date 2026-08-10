import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { queryDbOne, execDb } from '@/lib/db';
import type { User } from '@/types';

// ─── User identity ────────────────────────────────────────────
export async function getUserFromClerk(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
      ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;
    const normalized = email.trim().toLowerCase();

    let user = await queryDbOne<any>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalized]);
    if (!user) {
      const id = `usr-${userId.slice(-8)}`;
      await execDb(
        'INSERT INTO users (id, email, name, unit_number, phone, role) VALUES (?,?,?,?,?,?)',
        [id, normalized, clerkUser.fullName || normalized.split('@')[0], 'Unassigned', clerkUser.phoneNumbers?.[0]?.phoneNumber || null, 'user']
      );
      user = await queryDbOne<any>('SELECT * FROM users WHERE id = ?', [id]);
    }

    if (user?.status !== 'active') return null;
    return user as User;
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
