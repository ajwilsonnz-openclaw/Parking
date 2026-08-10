import { NextRequest, NextResponse } from 'next/server';
import { queryDbOne, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.text();
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const { type, data } = event;
  if (!type || !data) return NextResponse.json({ error: 'Invalid event shape' }, { status: 400 });

  try {
    if (type === 'user.deleted') {
      // Mark our mirror row disabled to deny access immediately
      const email = data.email_addresses?.[0]?.email_address;
      if (email) {
        await execDb("UPDATE users SET status = 'disabled' WHERE LOWER(email) = LOWER(?)", [email]);
      }
    }
    // We don't update users on user.updated to avoid drift; D1 is the canonical auth + profile source
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('webhook failed:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
