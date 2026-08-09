import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queryDbOne, queryDb, execDb } from '@/lib/db';
import { addNotification } from '@/lib/auth';

export const runtime = 'edge';

/** POST /api/sessions - book a spot */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      carparkId,
      spotNumber,
      vehiclePlate,
      durationHours,
      sessionType,
      visitorName,
      visitorPhone,
      savedGuestId,
    } = await req.json();

    if (!carparkId || !spotNumber || !vehiclePlate || !durationHours || !sessionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate carpark exists and is available
    const carpark = await queryDbOne<any>('SELECT * FROM carparks WHERE id = ?', [carparkId]);
    if (!carpark) return NextResponse.json({ error: 'Spot not found' }, { status: 404 });

    const activeOnSpot = await queryDb(
      'SELECT id FROM parking_sessions WHERE carpark_id = ? AND is_active = 1',
      [carparkId]
    );
    if (activeOnSpot.length > 0) {
      return NextResponse.json({ error: 'Spot is not available' }, { status: 409 });
    }

    // Validate session type constraint
    if (sessionType === 'resident_excess') {
      const ownsVehicle = await queryDbOne<any>(
        'SELECT id FROM unit_vehicles WHERE user_id = ? AND plate_number = ? AND status = ?',
        [user.id, vehiclePlate, 'approved']
      );
      if (!ownsVehicle) {
        return NextResponse.json(
          { error: 'Resident excess must use your own registered vehicle' },
          { status: 400 }
        );
      }
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 3600 * 1000);

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execDb(
      `INSERT INTO parking_sessions
        (id, carpark_id, spot_number, user_id, unit_number, vehicle_plate, session_type,
         start_time, expected_end_time, is_active, visitor_name, visitor_phone, saved_guest_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        sessionId,
        carparkId,
        spotNumber,
        user.id,
        user.unit_number,
        vehiclePlate,
        sessionType,
        startTime.toISOString(),
        endTime.toISOString(),
        1,
        visitorName || null,
        visitorPhone || null,
        savedGuestId || null,
      ]
    );

    // Mark spot as occupied
    await execDb('UPDATE carparks SET status = ? WHERE id = ?', ['occupied', carparkId]);

    await addNotification(
      user.id,
      'Carpark Booked',
      `Spot ${spotNumber} booked for ${vehiclePlate} for ${durationHours} hours.`
    );

    return NextResponse.json({ success: true, sessionId });
  } catch (err: any) {
    console.error('POST /api/sessions error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
