import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { carparkId, spotNumber, vehiclePlate, durationHours, sessionType, visitorName, visitorPhone, savedGuestId } = await req.json();

  if (!carparkId || !spotNumber || !vehiclePlate || !durationHours || !sessionType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (sessionType === 'resident_excess') {
    const owns = await queryDb(
      "SELECT id FROM unit_vehicles WHERE (user_id = ? OR unit_number = ?) AND plate_number = ? AND status = 'approved'",
      [user.id, user.unit_number, vehiclePlate]
    );
    if (!owns.length) return NextResponse.json({ error: 'Resident excess must use your own approved vehicle' }, { status: 400 });
  }

  const active = await queryDb('SELECT id FROM parking_sessions WHERE (carpark_id = ? OR spot_id = ?) AND is_active = 1', [carparkId, carparkId]);
  if (active.length) return NextResponse.json({ error: 'Spot not available' }, { status: 409 });

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationHours * 3600 * 1000);
  const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await execDb(
    `INSERT INTO parking_sessions
      (id, carpark_id, spot_id, spot_number, user_id, created_by_user_id, unit_number, vehicle_plate, session_type, start_time, expected_end_time, is_active, visitor_name, visitor_phone, saved_guest_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [sessionId, carparkId, carparkId, spotNumber, user.id, user.id, user.unit_number, vehiclePlate, sessionType, startTime.toISOString(), endTime.toISOString(), 1, visitorName || null, visitorPhone || null, savedGuestId || null]
  );

  await execDb('UPDATE carparks SET status = ? WHERE id = ? OR spot_number = ?', ['occupied', carparkId, spotNumber]);

  return NextResponse.json({ success: true, id: sessionId });
}
