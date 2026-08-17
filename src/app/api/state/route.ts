import { NextRequest, NextResponse } from 'next/server';
import { getUserFromClerk } from '@/lib/auth';
import { queryDb, ensureSchema, execDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await getUserFromClerk().catch(() => null);

  try {
    const nowIso = new Date().toISOString();

    // Auto-expire sessions whose expected end time has passed
    await execDb(
      `UPDATE parking_sessions 
       SET is_active = 0, end_time = COALESCE(end_time, expected_end_time) 
       WHERE is_active = 1 AND (expected_end_time <= ? OR expected_end_time <= datetime('now'))`,
      [nowIso]
    ).catch(() => {});

    // Set carparks back to available if they have no active session
    await execDb(
      `UPDATE carparks 
       SET status = 'available' 
       WHERE id NOT IN (SELECT carpark_id FROM parking_sessions WHERE is_active = 1)`
    ).catch(() => {});

    const safeQuery = async (sql: string, params: any[] = []) => {
      try {
        return await queryDb(sql, params);
      } catch (e: any) {
        console.error('[api/state safeQuery error]:', sql, e?.message);
        return [];
      }
    };

    const [carparks, sessionsRaw, vehiclesRaw, savedGuestsRaw, demerits, rentalsRaw, notificationsRaw, configRows, unitsRaw, whitelistRaw, sectionsRaw, sitesRaw] =
      await Promise.all([
        safeQuery('SELECT * FROM carparks ORDER BY spot_number'),
        safeQuery('SELECT * FROM parking_sessions ORDER BY expected_end_time DESC LIMIT 200'),
        user && (user.role === 'admin' || user.role === 'management')
          ? safeQuery('SELECT * FROM unit_vehicles ORDER BY requested_at DESC LIMIT 200')
          : user
          ? safeQuery('SELECT * FROM unit_vehicles WHERE user_id = ? OR unit_number = ? ORDER BY requested_at DESC', [user.id, user.unit_number])
          : Promise.resolve([]),
        user
          ? safeQuery('SELECT * FROM saved_guests WHERE user_id = ? ORDER BY created_at DESC', [user.id])
          : Promise.resolve([]),
        user && (user.role === 'admin' || user.role === 'management')
          ? safeQuery('SELECT * FROM demerits ORDER BY created_at DESC LIMIT 200')
          : user
          ? safeQuery('SELECT * FROM demerits WHERE user_id = ? OR unit_number = ? ORDER BY created_at DESC LIMIT 100', [user.id, user.unit_number])
          : Promise.resolve([]),
        safeQuery('SELECT * FROM spot_rentals ORDER BY created_at DESC LIMIT 100'),
        user
          ? safeQuery('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [user.id])
          : Promise.resolve([]),
        safeQuery('SELECT * FROM system_config'),
        safeQuery('SELECT * FROM units ORDER BY unit_number ASC'),
        safeQuery('SELECT * FROM whitelist ORDER BY added_at DESC'),
        safeQuery('SELECT * FROM sections ORDER BY display_order ASC'),
        safeQuery('SELECT * FROM sites LIMIT 1'),
      ]);

    const config: Record<string, string> = {};
    (configRows || []).forEach((row: any) => { config[row.key] = row.value; });

    const DEFAULT_SECTIONS = [
      { id: 'sec_entrance', site_id: 'site_mv', name: 'Entrance', display_order: 1, description: 'Main entrance area' },
      { id: 'sec_units_1_7', site_id: 'site_mv', name: 'Units 1–7', display_order: 2, description: 'Front townhouse wing' },
      { id: 'sec_units_8_13', site_id: 'site_mv', name: 'Units 8–13', display_order: 3, description: 'Middle townhouse wing' },
      { id: 'sec_back', site_id: 'site_mv', name: 'Back of Complex', display_order: 4, description: 'Rear courtyard area' },
    ];

    const DEFAULT_CARPARKS = [
      { id: 'cp_v01', site_id: 'site_mv', section_id: 'sec_entrance', section: 'Entrance', spot_number: 'V01', status: 'available' },
      { id: 'cp_v02', site_id: 'site_mv', section_id: 'sec_entrance', section: 'Entrance', spot_number: 'V02', status: 'available' },
      { id: 'cp_v03', site_id: 'site_mv', section_id: 'sec_entrance', section: 'Entrance', spot_number: 'V03', status: 'available' },
      { id: 'cp_v04', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V04', status: 'available' },
      { id: 'cp_v05', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V05', status: 'available' },
      { id: 'cp_v06', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V06', status: 'available' },
      { id: 'cp_v07', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V07', status: 'available' },
      { id: 'cp_v08', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V08', status: 'available' },
      { id: 'cp_v09', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V09', status: 'available' },
      { id: 'cp_v10', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V10', status: 'available' },
      { id: 'cp_v11', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V11', status: 'available' },
      { id: 'cp_v12', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V12', status: 'available' },
      { id: 'cp_v13', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V13', status: 'available' },
      { id: 'cp_v14', site_id: 'site_mv', section_id: 'sec_units_1_7', section: 'Units 1–7', spot_number: 'V14', status: 'available' },
      { id: 'cp_v15', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V15', status: 'available' },
      { id: 'cp_v16', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V16', status: 'available' },
      { id: 'cp_v17', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V17', status: 'available' },
      { id: 'cp_v18', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V18', status: 'available' },
      { id: 'cp_v19', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V19', status: 'available' },
      { id: 'cp_v20', site_id: 'site_mv', section_id: 'sec_units_8_13', section: 'Units 8–13', spot_number: 'V20', status: 'available' },
      { id: 'cp_v21', site_id: 'site_mv', section_id: 'sec_back', section: 'Back of Complex', spot_number: 'V21', status: 'available' },
      { id: 'cp_v22', site_id: 'site_mv', section_id: 'sec_back', section: 'Back of Complex', spot_number: 'V22', status: 'available' },
      { id: 'cp_v23', site_id: 'site_mv', section_id: 'sec_back', section: 'Back of Complex', spot_number: 'V23', status: 'available' },
    ];

    const finalCarparks = carparks && carparks.length > 0 ? carparks : DEFAULT_CARPARKS;
    const finalSections = sectionsRaw && sectionsRaw.length > 0 ? sectionsRaw : DEFAULT_SECTIONS;

    return NextResponse.json({
      user,
      carparks: finalCarparks,
      sessions: (sessionsRaw || []).map((s: any) => {
        const nowMs = Date.now();
        const endMs = new Date(s.expected_end_time).getTime();
        const isStillActive = !!s.is_active && endMs > nowMs && !s.end_time;

        return {
          id: s.id,
          spot_id: s.carpark_id,
          spot_number: s.spot_number,
          unit_number: s.unit_number,
          vehicle_plate: s.vehicle_plate,
          session_type: s.session_type,
          start_time: s.start_time,
          expected_end_time: s.expected_end_time,
          end_time: s.end_time,
          is_active: isStillActive,
          boot_requested: !!s.boot_requested,
          created_by_user_id: s.user_id,
          visitor_name: s.visitor_name,
          visitor_phone: s.visitor_phone,
          saved_guest_id: s.saved_guest_id,
        };
      }),
      vehicles: vehiclesRaw || [],
      savedGuests: savedGuestsRaw || [],
      demerits: demerits || [],
      rentals: rentalsRaw || [],
      notifications: notificationsRaw || [],
      units: unitsRaw || [],
      whitelist: whitelistRaw || [],
      sections: finalSections,
      site: sitesRaw && sitesRaw.length > 0 ? sitesRaw[0] : {
        id: 'site_mv',
        name: 'Millennium Village',
        address: '548 Albany Highway, Auckland',
        total_visitor_parks: 23,
        max_duration_hours: 24,
      },
      config: {
        max_visitor_hours: parseInt(config.max_visitor_hours || '24', 10),
        max_resident_excess_hours: parseInt(config.max_resident_excess_hours || '12', 10),
        max_weekly_rental_price: parseFloat(config.max_weekly_rental_price || '50'),
        demerit_fine_threshold: parseInt(config.demerit_fine_threshold || '3', 10),
        demerit_fine_amount: parseFloat(config.demerit_fine_amount || '50'),
        complex_name: config.complex_name || 'Millennium Village',
        complex_address: config.complex_address || '',
        spot_prefix: config.spot_prefix || 'V',
        header_icon: config.header_icon || 'building',
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
