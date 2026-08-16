-- Migration: 0006_multisite_sections.sql
-- Multi-site & dynamic sections architecture

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_visitor_parks INTEGER DEFAULT 23,
  max_duration_hours INTEGER DEFAULT 24,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sections_site ON sections(site_id);

-- Alter carparks to support site_id and section_id if not present
-- (SQLite safe column additions handled in ensureSchema)

-- Seed Site
INSERT OR REPLACE INTO sites (id, name, address, total_visitor_parks, max_duration_hours) VALUES
('site_mv', 'Millennium Village', '548 Albany Highway, Auckland', 23, 24);

-- Seed Sections
INSERT OR REPLACE INTO sections (id, site_id, name, display_order, description) VALUES
('sec_entrance', 'site_mv', 'Entrance', 1, 'Main Albany Highway entrance'),
('sec_units_1_7', 'site_mv', 'Units 1–7', 2, 'Front townhouse wing'),
('sec_units_8_13', 'site_mv', 'Units 8–13', 3, 'Middle townhouse wing'),
('sec_back', 'site_mv', 'Back of Complex', 4, 'Rear courtyard area');

-- Seed 23 Canonical Visitor Stalls (V01 to V23 - No Dash)
INSERT OR REPLACE INTO carparks (id, site_id, section_id, section, spot_number, status, is_rentable_private) VALUES
('cp_v01', 'site_mv', 'sec_entrance', 'Entrance', 'V01', 'available', 0),
('cp_v02', 'site_mv', 'sec_entrance', 'Entrance', 'V02', 'available', 0),
('cp_v03', 'site_mv', 'sec_entrance', 'Entrance', 'V03', 'available', 0),

('cp_v04', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V04', 'available', 0),
('cp_v05', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V05', 'available', 0),
('cp_v06', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V06', 'available', 0),
('cp_v07', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V07', 'available', 0),
('cp_v08', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V08', 'available', 0),
('cp_v09', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V09', 'available', 0),
('cp_v10', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V10', 'available', 0),
('cp_v11', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V11', 'available', 0),
('cp_v12', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V12', 'available', 0),
('cp_v13', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V13', 'available', 0),
('cp_v14', 'site_mv', 'sec_units_1_7', 'Units 1–7', 'V14', 'available', 0),

('cp_v15', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V15', 'available', 0),
('cp_v16', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V16', 'available', 0),
('cp_v17', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V17', 'available', 0),
('cp_v18', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V18', 'available', 0),
('cp_v19', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V19', 'available', 0),
('cp_v20', 'site_mv', 'sec_units_8_13', 'Units 8–13', 'V20', 'available', 0),

('cp_v21', 'site_mv', 'sec_back', 'Back of Complex', 'V21', 'available', 0),
('cp_v22', 'site_mv', 'sec_back', 'Back of Complex', 'V22', 'available', 0),
('cp_v23', 'site_mv', 'sec_back', 'Back of Complex', 'V23', 'available', 0);
