-- Identity layer: users, whitelist (invites), D1-resident sessions
-- Cloudflare D1 / SQLite

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('user','management','admin')) DEFAULT 'user',
  status TEXT CHECK(status IN ('active','disabled')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whitelist (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('user','management','admin')) DEFAULT 'user',
  added_by_user_id TEXT,
  used INTEGER DEFAULT 0,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- D1-resident sessions: our app-specific session (separate from Clerk)
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

-- Registered vehicles (approval workflow: pending → approved/rejected)
CREATE TABLE IF NOT EXISTS unit_vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  make_model_color TEXT,
  is_primary INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
  approved_by_user_id TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_unit_vehicles_user ON unit_vehicles(user_id);

-- Carparks (visitor, plus optional private spots resident may lend)
CREATE TABLE IF NOT EXISTS carparks (
  id TEXT PRIMARY KEY,
  spot_number TEXT UNIQUE NOT NULL,
  section TEXT DEFAULT '',
  status TEXT CHECK(status IN ('available','occupied','maintenance','rented')) DEFAULT 'available',
  is_rentable_private INTEGER DEFAULT 0,
  owner_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parking sessions (who parked where)
CREATE TABLE IF NOT EXISTS parking_sessions (
  id TEXT PRIMARY KEY,
  carpark_id TEXT NOT NULL REFERENCES carparks(id),
  spot_number TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  unit_number TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  session_type TEXT CHECK(session_type IN ('visitor','resident_excess','rented_private')) NOT NULL,
  start_time DATETIME NOT NULL,
  expected_end_time DATETIME NOT NULL,
  end_time DATETIME,
  is_active INTEGER DEFAULT 1,
  boot_requested INTEGER DEFAULT 0,
  visitor_name TEXT,
  visitor_phone TEXT,
  saved_guest_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON parking_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON parking_sessions(user_id);

-- Saved "regular visitors" (quick re-booking)
CREATE TABLE IF NOT EXISTS saved_guests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  plate TEXT NOT NULL,
  make_model_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_saved_guests_user ON saved_guests(user_id);

-- Demerit records
CREATE TABLE IF NOT EXISTS demerits (
  id TEXT PRIMARY KEY,
  unit_number TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  vehicle_plate TEXT NOT NULL,
  spot_number TEXT NOT NULL,
  violation_type TEXT CHECK(violation_type IN ('overtime','unauthorized_resident','wrong_spot','unregistered','other')) NOT NULL,
  description TEXT,
  demerit_points INTEGER DEFAULT 1,
  fine_amount REAL DEFAULT 0,
  status TEXT CHECK(status IN ('issued','appealed','resolved','waived')) DEFAULT 'issued',
  issued_by_user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_demerits_user ON demerits(user_id);

-- Personal carpark sharing (friendly)
CREATE TABLE IF NOT EXISTS spot_rentals (
  id TEXT PRIMARY KEY,
  carpark_id TEXT NOT NULL REFERENCES carparks(id),
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  spot_number TEXT NOT NULL,
  available_from DATETIME,
  available_until DATETIME,
  price_per_week REAL DEFAULT 0,
  is_free INTEGER DEFAULT 1,
  status TEXT CHECK(status IN ('listed','booked','completed','cancelled')) DEFAULT 'listed',
  renter_user_id TEXT REFERENCES users(id),
  renter_plate TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- In-app notification log
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

-- System config
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
