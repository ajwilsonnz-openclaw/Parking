import { NextRequest, NextResponse } from 'next/server';
import { getUserFromClerk } from '@/lib/auth';
import { queryDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const user = await getUserFromClerk();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const safeQuery = async (sql: string, params: any[] = []) => {
      try {
        return await queryDb(sql, params);
      } catch (e: any) {
        console.error('[api/state safeQuery error]:', sql, e?.message);
        return [];
      }
    };

    const [carparks, sessionsRaw, vehiclesRaw, savedGuestsRaw, demerits, rentalsRaw, notificationsRaw, configRows] =
      await Promise.all([
        safeQuery('SELECT * FROM carparks ORDER BY spot_number'),
        safeQuery('SELECT * FROM parking_sessions WHERE is_active = 1 ORDER BY expected_end_time ASC LIMIT 200'),
        user.role === 'admin' || user.role === 'management'
          ? safeQuery('SELECT * FROM unit_vehicles ORDER BY requested_at DESC LIMIT 200')
          : safeQuery('SELECT * FROM unit_vehicles WHERE user_id = ? ORDER BY requested_at DESC', [user.id]),
        safeQuery('SELECT * FROM saved_guests WHERE user_id = ? ORDER BY created_at DESC', [user.id]),
        user.role === 'admin' || user.role === 'management'
          ? safeQuery('SELECT * FROM demerits ORDER BY created_at DESC LIMIT 200')
          : safeQuery('SELECT * FROM demerits WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [user.id]),
        safeQuery('SELECT * FROM spot_rentals ORDER BY created_at DESC LIMIT 100'),
        safeQuery('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [user.id]),
        safeQuery('SELECT * FROM system_config'),
      ]);

    const config: Record<string, string> = {};
    (configRows || []).forEach((row: any) => { config[row.key] = row.value; });

    return NextResponse.json({
      user,
      carparks: carparks || [],
      sessions: (sessionsRaw || []).map((s: any) => ({
        id: s.id,
        spot_id: s.carpark_id,
        spot_number: s.spot_number,
        unit_number: s.unit_number,
        vehicle_plate: s.vehicle_plate,
        session_type: s.session_type,
        start_time: s.start_time,
        expected_end_time: s.expected_end_time,
        end_time: s.end_time,
        is_active: !!s.is_active,
        boot_requested: !!s.boot_requested,
        created_by_user_id: s.user_id,
        visitor_name: s.visitor_name,
        visitor_phone: s.visitor_phone,
        saved_guest_id: s.saved_guest_id,
      })),
      vehicles: vehiclesRaw || [],
      savedGuests: savedGuestsRaw || [],
      demerits: demerits || [],
      rentals: rentalsRaw || [],
      notifications: notificationsRaw || [],
      config: {
        max_visitor_hours: parseInt(config.max_visitor_hours || '24', 10),
        max_resident_excess_hours: parseInt(config.max_resident_excess_hours || '12', 10),
        max_weekly_rental_price: parseFloat(config.max_weekly_rental_price || '50'),
        demerit_fine_threshold: parseInt(config.demerit_fine_threshold || '3', 10),
        demerit_fine_amount: parseFloat(config.demerit_fine_amount || '50'),
        complex_name: config.complex_name || 'Millennium Village',
        complex_address: config.complex_address || '',
        spot_prefix: config.spot_prefix || 'V',
        total_visitor_parks: parseInt(config.total_visitor_parks || '20', 10),
        tow_agency_name: config.tow_agency_name || '',
        tow_agency_phone: config.tow_agency_phone || '',
        area_divisions: [],
      },
    });
  } catch (err: any) {
    console.error('/api/state error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
