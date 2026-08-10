import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { execDb, queryDbOne } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { targetEmail, role } = await req.json();
  if (!targetEmail || !role) {
    return NextResponse.json({ error: 'targetEmail and role required' }, { status: 400 });
  }

  const normalized = String(targetEmail).trim().toLowerCase();
  const validRoles = ['user', 'management', 'admin'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // 1. Update D1 tables
  await execDb('UPDATE users SET role = ? WHERE LOWER(email) = LOWER(?)', [role, normalized]);
  await execDb('UPDATE whitelist SET role = ? WHERE LOWER(email) = LOWER(?)', [role, normalized]);

  // 2. Sync to Clerk publicMetadata if user is in Clerk
  try {
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ emailAddress: [normalized] });
    if (users.data && users.data.length > 0) {
      await clerk.users.updateUserMetadata(users.data[0].id, {
        publicMetadata: { role },
      });
    }
  } catch (err: any) {
    console.warn('[api/admin/role] Clerk publicMetadata sync warning:', err?.message);
  }

  return NextResponse.json({ success: true, email: normalized, role });
}
