import { NextRequest, NextResponse } from 'next/server';
import { requireUser, handleApiError } from '@/lib/auth';
import { queryDb, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    return NextResponse.json({ passkeys: [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
