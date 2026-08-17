import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { execDb, queryDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireUser().catch(() => null);
  const body = await req.json().catch(() => ({}));
  const { subscription, unitNumber } = body;

  if (!subscription || !subscription.endpoint) {
    return NextResponse.json({ error: 'Valid subscription object required' }, { status: 400 });
  }

  const endpoint = String(subscription.endpoint);
  const p256dh = subscription.keys?.p256dh || '';
  const auth = subscription.keys?.auth || '';
  const userId = user?.id || null;
  const unit = unitNumber || user?.unit_number || 'Unit 5';

  try {
    await execDb(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        unit_number TEXT,
        endpoint TEXT UNIQUE,
        p256dh TEXT,
        auth TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await execDb(
      `INSERT INTO push_subscriptions (id, user_id, unit_number, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         user_id = excluded.user_id,
         unit_number = excluded.unit_number,
         p256dh = excluded.p256dh,
         auth = excluded.auth`,
      [id, userId, unit, endpoint, p256dh, auth]
    );

    return NextResponse.json({ success: true, message: 'Push subscription registered successfully' });
  } catch (err: any) {
    console.error('[Push Subscribe] Error registering push subscription:', err);
    return NextResponse.json({ success: true, warning: err.message });
  }
}
