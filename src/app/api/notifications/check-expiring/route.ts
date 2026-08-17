import { NextRequest, NextResponse } from 'next/server';
import { queryDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});

  try {
    const activeSessions = await queryDb<any>(`
      SELECT id, spot_number, vehicle_plate, unit_number, expected_end_time, visitor_name
      FROM parking_sessions
      WHERE is_active = 1
    `).catch(() => []);

    const now = Date.now();
    const expiringSoon = activeSessions.filter((s) => {
      if (!s.expected_end_time) return false;
      const endMs = new Date(s.expected_end_time).getTime();
      const diffMins = (endMs - now) / 60000;
      return diffMins > 0 && diffMins <= 15;
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      activeCount: activeSessions.length,
      expiringSoonCount: expiringSoon.length,
      expiringSessions: expiringSoon,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
