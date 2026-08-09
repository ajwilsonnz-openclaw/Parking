import { Carpark, ParkingSession, User, UnitVehicle, DemeritRecord, SpotRental, SystemConfig, WhitelistEntry } from '@/types';

const now = new Date();

export const INITIAL_CONFIG: SystemConfig = {
  max_visitor_hours: 24,
  max_resident_excess_hours: 12,
  max_weekly_rental_price: 50.0,
  complex_name: 'Millennium Village',
  demerit_fine_threshold: 3,
  demerit_fine_amount: 50,
  tow_agency_name: 'Citywide Towing & Recovery',
  tow_agency_phone: '+64 9 555 8697',
  total_visitor_parks: 20,
  spot_prefix: 'V',
  area_divisions: [], // Phase 5 will add configuration
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    email: 'resident@millennium.com',
    name: 'Adam Miller',
    unit_number: 'Unit 12',
    phone: '+64 21 555 0192',
    role: 'user',
    status: 'active',
    created_at: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'usr-2',
    email: 'manager@millennium.com',
    name: 'Sarah Jenkins',
    unit_number: 'Body Corp Office',
    phone: '+64 21 555 0888',
    role: 'management',
    status: 'active',
    created_at: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'usr-3',
    email: 'admin@millennium.com',
    name: 'BodyCorp Admin',
    unit_number: 'Body Corp HQ',
    phone: '+64 21 555 0999',
    role: 'admin',
    status: 'active',
    created_at: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'usr-4',
    email: 'unit8@millennium.com',
    name: 'David Chen',
    unit_number: 'Unit 8',
    phone: '+64 21 555 0441',
    role: 'user',
    status: 'active',
    created_at: '2026-08-01T00:00:00.000Z',
  },
];

export const INITIAL_VEHICLES: UnitVehicle[] = [
  { id: 'v-1', unit_number: 'Unit 12', plate_number: 'GHJ125', make_model_color: 'White Tesla Model 3', is_primary: true },
  { id: 'v-2', unit_number: 'Unit 12', plate_number: 'KXM890', make_model_color: 'Silver Mazda CX-5', is_primary: false },
  { id: 'v-3', unit_number: 'Unit 8', plate_number: 'PQR334', make_model_color: 'Black BMW 330i', is_primary: true },
  { id: 'v-4', unit_number: 'Unit 27', plate_number: 'BZT761', make_model_color: 'Blue Toyota RAV4', is_primary: true },
];

export const INITIAL_CARPARKS: Carpark[] = (Array.from({ length: 20 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  const status: Carpark['status'] = i === 2 || i === 4 || i === 7 || i === 11 || i === 15 ? 'occupied' : 'available';
  return {
    id: `spot-${num}`,
    spot_number: `V${num}`,     // short form: V01…V20
    section: '',                // no physical sections here
    status,
    is_rentable_private: false,
    is_favourite: i === 0 || i === 3,
  };
}) as Carpark[]).concat([
  // Private resident spots (assigned to specific units)
  {
    id: 'spot-p1',
    spot_number: 'P1',
    section: '',
    status: 'rented',
    is_rentable_private: true,
    owner_unit_number: 'Unit 18',
  },
  {
    id: 'spot-p2',
    spot_number: 'P2',
    section: '',
    status: 'available',
    is_rentable_private: true,
    owner_unit_number: 'Unit 12',
  }
]);

const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const hoursAhead = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

export const INITIAL_SESSIONS: ParkingSession[] = [
  {
    id: 'sess-1',
    spot_id: 'spot-03',
    spot_number: 'V03',
    unit_number: 'Unit 12',
    vehicle_plate: 'GHJ125',
    session_type: 'visitor',
    start_time: hoursAgo(2.5),
    expected_end_time: hoursAhead(1.5),
    is_active: true,
    created_by_user_id: 'usr-1',
    visitor_name: 'Mark Taylor',
    visitor_phone: '+64 21 555 9911',
  },
  {
    id: 'sess-2',
    spot_id: 'spot-05',
    spot_number: 'V05',
    unit_number: 'Unit 8',
    vehicle_plate: 'PQR334',
    session_type: 'resident_excess',
    start_time: hoursAgo(10),
    expected_end_time: hoursAhead(2),
    is_active: true,
    created_by_user_id: 'usr-4',
    boot_requested: true,
  },
  {
    id: 'sess-3',
    spot_id: 'spot-08',
    spot_number: 'V08',
    unit_number: 'Unit 27',
    vehicle_plate: 'BZT761',
    session_type: 'visitor',
    start_time: hoursAgo(1.0),
    expected_end_time: hoursAhead(23.0),
    is_active: true,
    created_by_user_id: 'usr-1',
    visitor_name: 'Plumber Service',
  },
  {
    id: 'sess-4',
    spot_id: 'spot-12',
    spot_number: 'V12',
    unit_number: 'Unit 31',
    vehicle_plate: 'LMN404',
    session_type: 'resident_excess',
    start_time: hoursAgo(4.0),
    expected_end_time: hoursAhead(8.0),
    is_active: true,
    created_by_user_id: 'usr-2',
  },
  {
    id: 'sess-5',
    spot_id: 'spot-16',
    spot_number: 'V16',
    unit_number: 'Unit 5',
    vehicle_plate: 'WXY990',
    session_type: 'visitor',
    start_time: hoursAgo(23.5),
    expected_end_time: hoursAhead(0.5),
    is_active: true,
    created_by_user_id: 'usr-3',
  }
];

export const INITIAL_DEMERITS: DemeritRecord[] = [
  {
    id: 'dem-1',
    unit_number: 'Unit 8',
    vehicle_plate: 'PQR334',
    spot_number: 'V05',
    violation_type: 'overtime',
    description: 'Exceeded resident excess stay time by 4 hours during peak visitor window.',
    demerit_points: 2,
    fine_amount: 0,
    status: 'issued',
    created_at: hoursAgo(48),
  },
  {
    id: 'dem-2',
    unit_number: 'Unit 8',
    vehicle_plate: 'PQR334',
    spot_number: 'V02',
    violation_type: 'unauthorized_resident',
    description: 'Parked in visitor space without active session registered on app.',
    demerit_points: 1,
    fine_amount: 50,
    status: 'issued',
    created_at: hoursAgo(12),
  },
  {
    id: 'dem-3',
    unit_number: 'Unit 31',
    vehicle_plate: 'LMN404',
    spot_number: 'V12',
    violation_type: 'wrong_spot',
    description: 'Blocked access lane near entrance barrier.',
    demerit_points: 1,
    fine_amount: 0,
    status: 'issued',
    created_at: hoursAgo(72),
  }
];

export const INITIAL_SPOT_RENTALS: SpotRental[] = [
  {
    id: 'rent-1',
    owner_unit_number: 'Unit 12',
    spot_number: 'P2',
    available_from: hoursAhead(1),
    available_until: hoursAhead(168), // 1 week
    price_per_week: 35.00,
    is_free: false,
    status: 'listed',
  },
  {
    id: 'rent-2',
    owner_unit_number: 'Unit 18',
    spot_number: 'P1',
    available_from: hoursAgo(2),
    available_until: hoursAhead(168),
    price_per_week: 0.0,
    is_free: true,
    status: 'booked',
    renter_unit_number: 'Unit 33',
    renter_plate: 'TRK881',
  }
];

export const INITIAL_WHITELIST: WhitelistEntry[] = [
  { id: 'w-1', email: 'resident@millennium.com', name: 'Adam Miller', unit_number: 'Unit 12', phone: '+64 21 555 0192', role: 'user', added_at: '2026-08-01T00:00:00.000Z' },
  { id: 'w-2', email: 'manager@millennium.com', name: 'Sarah Jenkins', unit_number: 'Body Corp Office', phone: '+64 21 555 0888', role: 'management', added_at: '2026-08-01T00:00:00.000Z' },
  { id: 'w-3', email: 'admin@millennium.com', name: 'BodyCorp Admin', unit_number: 'Body Corp HQ', phone: '+64 21 555 0999', role: 'admin', added_at: '2026-08-01T00:00:00.000Z' },
  { id: 'w-4', email: 'unit8@millennium.com', name: 'David Chen', unit_number: 'Unit 8', phone: '+64 21 555 0441', role: 'user', added_at: '2026-08-01T00:00:00.000Z' },
];
