import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { queryDbOne, execDb } from '@/lib/db';
import type { User } from '@/types';

// ─── Strict Whitelist User identity ─────────────────────────────
export async function getUserFromClerk(): Promise<User | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
      ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;
    const normalized = email.trim().toLowerCase();

    const isOwnerAdmin = normalized === 'ajwilsonnz@gmail.com' || normalized.startsWith('admin@');
    const clerkRole = (clerkUser.publicMetadata as any)?.role;

    // Check whitelist and users tables in D1
    const whitelistEntry = await queryDbOne<any>('SELECT * FROM whitelist WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);
    let dbUser = await queryDbOne<any>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);

    // STRICT ACCESS GATEKEEPER:
    // If not owner admin, and not in whitelist table, and not in users table -> REJECT LOG IN!
    if (!isOwnerAdmin && !whitelistEntry && !dbUser) {
      console.warn(`[getUserFromClerk] ACCESS DENIED: Email ${normalized} is not whitelisted by management.`);
      return null;
    }

    let assignedRole = isOwnerAdmin ? 'admin' : (whitelistEntry?.role || dbUser?.role || clerkRole || 'user');
    let assignedUnit = isOwnerAdmin ? 'Body Corp HQ' : (whitelistEntry?.unit_number || dbUser?.unit_number || 'Unassigned');
    let assignedName = whitelistEntry?.name || dbUser?.name || clerkUser.fullName || (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : normalized.split('@')[0]);
    let assignedPhone = whitelistEntry?.phone || dbUser?.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || '';
    let assignedParks = whitelistEntry?.assigned_parks || dbUser?.assigned_parks || 1;

    const userObj: User = {
      id: dbUser?.id || `usr-${userId.slice(-8)}`,
      email: normalized,
      name: assignedName,
      unit_number: assignedUnit,
      phone: assignedPhone,
      role: assignedRole as any,
      status: 'active',
      assigned_parks: assignedParks,
      created_at: dbUser?.created_at || new Date().toISOString(),
    };

    // Ensure user exists in users table
    if (!dbUser) {
      await execDb(
        'INSERT INTO users (id, email, name, unit_number, phone, role, status) VALUES (?,?,?,?,?,?,?)',
        [userObj.id, normalized, userObj.name, userObj.unit_number, userObj.phone, userObj.role, 'active']
      ).catch(() => {});
    } else if (dbUser.status === 'disabled' || dbUser.status === 'suspended') {
      return null;
    }

    return userObj;
  } catch (e) {
    console.error('getUserFromClerk error:', e);
    return null;
  }
}

// ─── Auth guards ───────────────────────────────────────────────
export async function requireUser(): Promise<User | null> {
  return getUserFromClerk();
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getUserFromClerk();
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function requireManagement(): Promise<User | null> {
  const user = await getUserFromClerk();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) return null;
  return user;
}

export function handleApiError(err: any) {
  console.error('API Error:', err);
  return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
}
