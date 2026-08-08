-- Millennium Village Car Park - Cloudflare D1 / SQLite Database Schema

-- 1. Whitelist Table (Admin Access Provisioning)
CREATE TABLE IF NOT EXISTS whitelist (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('user', 'management', 'admin')) DEFAULT 'user',
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registered Unit Vehicles
CREATE TABLE IF NOT EXISTS unit_vehicles (
  id TEXT PRIMARY KEY,
  unit_number TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  make_model_color TEXT,
  is_primary INTEGER DEFAULT 1
);

-- 3. Carparks & Spots
CREATE TABLE IF NOT EXISTS carparks (
  id TEXT PRIMARY KEY,
  spot_number TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL,
  status TEXT CHECK(status IN ('available', 'occupied', 'maintenance', 'rented')) DEFAULT 'available',
  is_rentable_private INTEGER DEFAULT 0,
  owner_unit_number TEXT
);

-- 4. Parking Sessions
CREATE TABLE IF NOT EXISTS parking_sessions (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  spot_number TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  session_type TEXT CHECK(session_type IN ('visitor', 'resident_excess', 'rented_private')) NOT NULL,
  start_time DATETIME NOT NULL,
  expected_end_time DATETIME NOT NULL,
  end_time DATETIME,
  is_active INTEGER DEFAULT 1,
  boot_requested INTEGER DEFAULT 0,
  created_by_user_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_phone TEXT
);

-- 5. Spot Weekly Rentals
CREATE TABLE IF NOT EXISTS spot_rentals (
  id TEXT PRIMARY KEY,
  owner_unit_number TEXT NOT NULL,
  spot_number TEXT NOT NULL,
  available_from DATETIME NOT NULL,
  available_until DATETIME NOT NULL,
  price_per_week REAL DEFAULT 0.0,
  is_free INTEGER DEFAULT 1,
  status TEXT CHECK(status IN ('listed', 'booked', 'completed', 'cancelled')) DEFAULT 'listed',
  renter_unit_number TEXT,
  renter_plate TEXT
);

-- 6. Demerit Records
CREATE TABLE IF NOT EXISTS demerits (
  id TEXT PRIMARY KEY,
  unit_number TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  spot_number TEXT NOT NULL,
  violation_type TEXT CHECK(violation_type IN ('overtime', 'unauthorized_resident', 'wrong_spot', 'unregistered')) NOT NULL,
  description TEXT,
  demerit_points INTEGER DEFAULT 1,
  fine_amount REAL DEFAULT 0.0,
  status TEXT CHECK(status IN ('issued', 'appealed', 'resolved')) DEFAULT 'issued',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. System Configuration Variables
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Seed Default Whitelist Entries
INSERT OR IGNORE INTO whitelist (id, email, name, unit_number, phone, role) VALUES
  ('w-1', 'resident@millennium.com', 'Adam Miller', 'Unit 402', '+64 21 555 0192', 'user'),
  ('w-2', 'manager@millennium.com', 'Sarah Jenkins', 'Building Office', '+64 21 555 0888', 'management'),
  ('w-3', 'admin@millennium.com', 'BodyCorp Admin', 'HQ Admin', '+64 21 555 0999', 'admin'),
  ('w-4', 'unit108@millennium.com', 'David Chen', 'Unit 108', '+64 21 555 0441', 'user');

-- Seed Default Vehicles
INSERT OR IGNORE INTO unit_vehicles (id, unit_number, plate_number, make_model_color, is_primary) VALUES
  ('v-1', 'Unit 402', 'GHJ125', 'White Tesla Model 3', 1),
  ('v-2', 'Unit 402', 'KXM890', 'Silver Mazda CX-5', 0),
  ('v-3', 'Unit 108', 'PQR334', 'Black BMW 330i', 1),
  ('v-4', 'Unit 205', 'BZT761', 'Blue Toyota RAV4', 1);

-- Seed Config Variables
INSERT OR IGNORE INTO system_config (key, value) VALUES
  ('max_visitor_hours', '24'),
  ('max_resident_excess_hours', '12'),
  ('max_weekly_rental_price', '50.0'),
  ('complex_name', 'Millennium Village'),
  ('demerit_fine_threshold', '3'),
  ('demerit_fine_amount', '50'),
  ('tow_agency_name', 'Citywide Towing & Recovery'),
  ('tow_agency_phone', '+64 9 555 8697'),
  ('total_visitor_parks', '20'),
  ('spot_prefix', 'V-'),
  ('area_divisions', 'Ground Floor, Basement Level 1');
