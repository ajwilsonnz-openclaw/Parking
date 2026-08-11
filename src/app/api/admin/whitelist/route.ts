import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await queryDb('SELECT * FROM whitelist ORDER BY added_at DESC LIMIT 500');
  return NextResponse.json({ whitelist: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, name, unit_number, phone, role, assigned_parks } = await req.json();
  if (!email || !unit_number) return NextResponse.json({ error: 'Email and unit required' }, { status: 400 });

  const normalized = String(email).trim().toLowerCase();
  const assignedRole = role || 'user';
  const parksNum = parseInt(assigned_parks) || 1;

  const existingWl = await queryDb('SELECT id FROM whitelist WHERE LOWER(email) = LOWER(?)', [normalized]);
  if (existingWl.length > 0) {
    await execDb(
      'UPDATE whitelist SET name = ?, unit_number = ?, phone = ?, role = ?, assigned_parks = ? WHERE LOWER(email) = LOWER(?)',
      [name || normalized.split('@')[0], unit_number, phone || null, assignedRole, parksNum, normalized]
    );
  } else {
    const id = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await execDb(
      'INSERT INTO whitelist (id, email, name, unit_number, phone, role, assigned_parks, added_by_user_id) VALUES (?,?,?,?,?,?,?,?)',
      [id, normalized, name || normalized.split('@')[0], unit_number, phone || null, assignedRole, parksNum, user.id]
    ).catch(async () => {
      await execDb(
        'INSERT INTO whitelist (id, email, name, unit_number, phone, role, added_by_user_id) VALUES (?,?,?,?,?,?,?)',
        [id, normalized, name || normalized.split('@')[0], unit_number, phone || null, assignedRole, user.id]
      );
    });
  }

  // Pre-provision or update in users table
  const existingUser = await queryDb('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [normalized]);
  if (existingUser.length === 0) {
    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await execDb(
      'INSERT INTO users (id, email, name, unit_number, phone, role, status) VALUES (?,?,?,?,?,?,?)',
      [newUserId, normalized, name || normalized.split('@')[0], unit_number, phone || '', assignedRole, 'active']
    ).catch(() => {});
  } else {
    await execDb(
      'UPDATE users SET name = ?, unit_number = ?, phone = ?, role = ? WHERE LOWER(email) = LOWER(?)',
      [name || normalized.split('@')[0], unit_number, phone || '', assignedRole, normalized]
    ).catch(() => {});
  }

  // Register on Clerk Servers (Allowlist & Invitation Email)
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const clerk = await clerkClient();

    // 1. Add to Clerk Allowlist
    try {
      await clerk.allowlistIdentifiers.createAllowlistIdentifier({
        identifier: normalized,
        notify: false,
      });
    } catch (e: any) {
      console.log('[whitelist] Clerk allowlist notice (may already exist):', e?.message || e);
    }

    // 2. Create Clerk Invitation (sends email invite & sets role metadata)
    try {
      await clerk.invitations.createInvitation({
        emailAddress: normalized,
        publicMetadata: { role: assignedRole, unit_number },
        ignoreExisting: true,
      });
    } catch (e: any) {
      console.log('[whitelist] Clerk invitation notice:', e?.message || e);
    }

    // 3. Update metadata if user already has an active Clerk account
    const users = await clerk.users.getUserList({ emailAddress: [normalized] });
    if (users.data && users.data.length > 0) {
      await clerk.users.updateUserMetadata(users.data[0].id, {
        publicMetadata: { role: assignedRole, unit_number },
      });
    }
  } catch (err) {
    console.warn('[whitelist] Clerk API integration warning:', err);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM whitelist WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
