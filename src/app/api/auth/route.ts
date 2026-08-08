import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { WhitelistEntry } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rows = await queryDb<WhitelistEntry>(
      'SELECT * FROM whitelist WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          error: 'Access Denied. Your email has not been whitelisted by the building management.',
        },
        { status: 403 }
      );
    }

    const entry = rows[0];
    return NextResponse.json({
      success: true,
      user: {
        id: entry.id,
        email: entry.email,
        name: entry.name,
        unit_number: entry.unit_number,
        phone: entry.phone,
        role: entry.role,
        status: 'active',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
