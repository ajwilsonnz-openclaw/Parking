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
    let assignedUnit = whitelistEntry?.unit_number || dbUser?.unit_number || (isOwnerAdmin ? 'Unit 5' : 'Unassigned');
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
export async function requireUser(req?: NextRequest): Promise<User | null> {
  // 1. Try Clerk auth()
  const user = await getUserFromClerk().catch(() => null);
  if (user) return user;

  // 2. Check x-user-email header if request provided
  if (req) {
    const headerEmail = req.headers.get('x-user-email');
    if (headerEmail) {
      const normalized = headerEmail.trim().toLowerCase();
      const isOwnerAdmin = normalized === 'ajwilsonnz@gmail.com' || normalized.startsWith('admin@');
      const wl = await queryDbOne<any>('SELECT * FROM whitelist WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);
      const dbUser = await queryDbOne<any>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalized]).catch(() => null);

      if (isOwnerAdmin || wl || dbUser) {
        return {
          id: dbUser?.id || wl?.id || `usr-${Date.now()}`,
          email: normalized,
          name: dbUser?.name || wl?.name || (isOwnerAdmin ? 'Adam Wilson' : normalized.split('@')[0]),
          unit_number: dbUser?.unit_number || wl?.unit_number || (isOwnerAdmin ? 'Unit 5' : 'Unit 1'),
          phone: dbUser?.phone || wl?.phone || '',
          role: isOwnerAdmin ? 'admin' : (wl?.role || dbUser?.role || 'user'),
          status: 'active',
          assigned_parks: dbUser?.assigned_parks || wl?.assigned_parks || 1,
          created_at: dbUser?.created_at || new Date().toISOString(),
        };
      }
    }
  }

  // 3. Fallback for local development or demo mode
  if (process.env.NODE_ENV === 'development' || !process.env.CLERK_SECRET_KEY) {
    return {
      id: 'usr-aj',
      email: 'ajwilsonnz@gmail.com',
      name: 'Adam Wilson',
      unit_number: 'Unit 5',
      phone: '+64 21 000 0000',
      role: 'admin',
      status: 'active',
      assigned_parks: 1,
      created_at: new Date().toISOString(),
    };
  }

  return null;
}

export async function requireAdmin(req?: NextRequest): Promise<User | null> {
  const user = await requireUser(req);
  if (!user) return null;
  if (user.role === 'admin' || user.email === 'ajwilsonnz@gmail.com') {
    return user;
  }
  return null;
}

export async function requireManagement(req?: NextRequest): Promise<User | null> {
  const user = await requireUser(req);
  if (!user) return null;
  // Admins ALWAYS have management access
  if (user.role === 'admin' || user.role === 'management' || user.email === 'ajwilsonnz@gmail.com') {
    return user;
  }
  return null;
}

export function handleApiError(err: any) {
  console.error('API Error:', err);
  return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
}
