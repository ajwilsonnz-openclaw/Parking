export type Role = 'user' | 'management' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  unit_number: string;
  phone: string;
  role: Role;
  status: 'active' | 'disabled';
  assigned_parks?: number;
  created_at: string;
}

export interface UnitVehicle {
  id: string;
  user_id?: string;
  unit_number: string;
  plate_number: string;
  make_model_color: string;
  is_primary?: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AssignedSpot {
  id: string;
  unit_number: string;
  spot_number: string;
  floor_section: string;
}

export type SpotStatus = 'available' | 'occupied' | 'maintenance' | 'rented';

export interface Carpark {
  id: string;
  spot_number: string;
  section: string;
  status: SpotStatus;
  is_rentable_private?: boolean;
  owner_unit_number?: string;
  is_favourite?: boolean;
}

export type SessionType = 'visitor' | 'resident_excess' | 'rented_private';

export interface ParkingSession {
  id: string;
  spot_id: string;
  spot_number: string;
  unit_number: string;
  vehicle_plate: string;
  session_type: SessionType;
  start_time: string; // ISO string
  expected_end_time: string; // ISO string
  end_time?: string;
  is_active: boolean;
  boot_requested?: boolean;
  created_by_user_id: string;
  visitor_name?: string;
  visitor_phone?: string;
}

export interface SpotRental {
  id: string;
  owner_unit_number: string;
  spot_number: string;
  available_from: string;
  available_until: string;
  price_per_week: number;
  is_free: boolean;
  status: 'listed' | 'booked' | 'completed' | 'cancelled';
  renter_unit_number?: string;
  renter_plate?: string;
}

export interface DemeritRecord {
  id: string;
  unit_number: string;
  vehicle_plate: string;
  spot_number: string;
  violation_type: 'overtime' | 'unauthorized_resident' | 'wrong_spot' | 'unregistered';
  description: string;
  demerit_points: number;
  fine_amount: number;
  status: 'issued' | 'appealed' | 'resolved';
  created_at: string;
}

export interface SystemConfig {
  max_visitor_hours: number; // default 24
  max_resident_excess_hours: number; // default 12
  max_weekly_rental_price: number; // default 50.00
  complex_name: string;
  complex_address?: string;
  header_icon?: string; // 'building' | 'car' | 'shield' | 'zap' | 'compass'
  demerit_fine_threshold: number; // default 3
  demerit_fine_amount: number; // default 50
  tow_agency_name: string;
  tow_agency_phone: string;
  total_visitor_parks: number; // default 20
  spot_prefix: string; // default 'V'
  area_divisions: string[]; // e.g. ['Ground Floor', 'Basement Level 1'] or ['Front Lot', 'Back Lot']
}

export interface WhitelistEntry {
  id: string;
  email: string;
  name: string;
  unit_number: string;
  phone: string;
  role: Role;
  added_at: string;
}

export interface SavedGuest {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  plate: string;
  make_model_color?: string;
  created_at: string;
}

export interface NotificationLogEntry {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}
