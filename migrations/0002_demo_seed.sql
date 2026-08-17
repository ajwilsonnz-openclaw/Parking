-- Demo seed data. Opt-in. Can be wiped with scripts/reset-demo.sql.
-- Inserts the 3 role accounts (user/management/admin), plus 2 extra residents,
-- 4 vehicles, 20 visitor carparks, 5 active sessions, 3 demerits, 2 rental listings,
-- 2 saved guests, 1 welcome notification, and sensible system_config defaults.

-- Users (whitelist + users rows for each)
INSERT OR IGNORE INTO whitelist (id, email, name, unit_number, phone, role) VALUES
  ('wl-aj', 'ajwilsonnz@gmail.com', 'Adam Wilson', 'Unit 5', '+64 21 000 0000', 'admin'),
  ('wl-1', 'resident@millennium.com', 'Adam Miller', 'Unit 12', '+64 21 555 0192', 'user'),
  ('wl-2', 'manager@millennium.com', 'Sarah Jenkins', 'Body Corp Office', '+64 21 555 0888', 'management'),
  ('wl-3', 'admin@millennium.com', 'BodyCorp Admin', 'Body Corp HQ', '+64 21 555 0999', 'admin'),
  ('wl-4', 'unit8@millennium.com', 'David Chen', 'Unit 8', '+64 21 555 0441', 'user'),
  ('wl-5', 'unit27@millennium.com', 'Emma Williams', 'Unit 27', '+64 21 555 0772', 'user');

INSERT OR IGNORE INTO users (id, email, name, unit_number, phone, role, status) VALUES
  ('usr-aj', 'ajwilsonnz@gmail.com', 'Adam Wilson', 'Unit 5', '+64 21 000 0000', 'admin', 'active'),
  ('usr-1', 'resident@millennium.com', 'Adam Miller', 'Unit 12', '+64 21 555 0192', 'user', 'active'),
  ('usr-2', 'manager@millennium.com', 'Sarah Jenkins', 'Body Corp Office', '+64 21 555 0888', 'management', 'active'),
  ('usr-3', 'admin@millennium.com', 'BodyCorp Admin', 'Body Corp HQ', '+64 21 555 0999', 'admin', 'active'),
  ('usr-4', 'unit8@millennium.com', 'David Chen', 'Unit 8', '+64 21 555 0441', 'user', 'active'),
  ('usr-5', 'unit27@millennium.com', 'Emma Williams', 'Unit 27', '+64 21 555 0772', 'user', 'active');

-- Vehicles for these users
INSERT OR IGNORE INTO unit_vehicles (id, user_id, unit_number, plate_number, make_model_color, is_primary, status) VALUES
  ('v-1', 'usr-1', 'Unit 12', 'GHJ125', 'White Tesla Model 3', 1, 'approved'),
  ('v-2', 'usr-1', 'Unit 12', 'KXM890', 'Silver Mazda CX-5', 0, 'approved'),
  ('v-3', 'usr-4', 'Unit 8', 'PQR334', 'Black BMW 330i', 1, 'approved'),
  ('v-4', 'usr-5', 'Unit 27', 'BZT761', 'Blue Toyota RAV4', 1, 'approved');

-- 20 visitor carparks (V01…V20)
INSERT OR IGNORE INTO carparks (id, spot_number, section, status, is_rentable_private) VALUES
  ('cp-01','V01','','available',0),
  ('cp-02','V02','','available',0),
  ('cp-03','V03','','occupied',0),
  ('cp-04','V04','','available',0),
  ('cp-05','V05','','occupied',0),
  ('cp-06','V06','','available',0),
  ('cp-07','V07','','available',0),
  ('cp-08','V08','','occupied',0),
  ('cp-09','V09','','available',0),
  ('cp-10','V10','','available',0),
  ('cp-11','V11','','available',0),
  ('cp-12','V12','','occupied',0),
  ('cp-13','V13','','available',0),
  ('cp-14','V14','','available',0),
  ('cp-15','V15','','available',0),
  ('cp-16','V16','','occupied',0),
  ('cp-17','V17','','available',0),
  ('cp-18','V18','','available',0),
  ('cp-19','V19','','available',0),
  ('cp-20','V20','','available',0);

-- Active parking sessions
INSERT OR IGNORE INTO parking_sessions
  (id, carpark_id, spot_number, user_id, unit_number, vehicle_plate, session_type, start_time, expected_end_time, is_active, visitor_name, visitor_phone) VALUES
  ('sess-1','cp-03','V03','usr-1','Unit 12','GHJ125','visitor', datetime('now','-2 hours'), datetime('now','+2 hours'), 1, 'Mark Taylor', '+64 21 555 9911'),
  ('sess-2','cp-05','V05','usr-4','Unit 8','PQR334','resident_excess', datetime('now','-10 hours'), datetime('now','+2 hours'), 1, NULL, NULL),
  ('sess-3','cp-08','V08','usr-5','Unit 27','BZT761','visitor', datetime('now','-1 hours'), datetime('now','+23 hours'), 1, 'Plumber Service', NULL),
  ('sess-4','cp-12','V12','usr-2','Body Corp Office','LMN404','resident_excess', datetime('now','-4 hours'), datetime('now','+8 hours'), 1, NULL, NULL),
  ('sess-5','cp-16','V16','usr-3','Body Corp HQ','WXY990','visitor', datetime('now','-23 hours'), datetime('now','+30 minutes'), 1, NULL, NULL);

-- Demerits
INSERT OR IGNORE INTO demerits
  (id, unit_number, user_id, vehicle_plate, spot_number, violation_type, description, demerit_points, fine_amount, status, issued_by_user_id) VALUES
  ('dem-1','Unit 8','usr-4','PQR334','V05','overtime','Exceeded resident excess stay time by 4 hours during peak visitor window.',2,0,'issued','usr-2'),
  ('dem-2','Unit 8','usr-4','PQR334','V02','unauthorized_resident','Parked in visitor space without active session registered on app.',1,50,'issued','usr-2'),
  ('dem-3','Unit 31',NULL,'LMN404','V12','wrong_spot','Blocked access lane near entrance barrier.',1,0,'issued','usr-2');

-- Spot rentals (2 listed, one free)
INSERT OR IGNORE INTO spot_rentals
  (id, carpark_id, owner_user_id, spot_number, available_from, available_until, price_per_week, is_free, status) VALUES
  ('rent-1','cp-04','usr-1','P1', NULL, NULL, 0, 1, 'listed'),
  ('rent-2','cp-04','usr-4','P8', datetime('now'), datetime('now','+14 days'), 20, 0, 'listed');

-- Saved guests for Adam
INSERT OR IGNORE INTO saved_guests (id, user_id, name, phone, plate, make_model_color) VALUES
  ('sg-1','usr-1','Mark Taylor','+64 21 555 9911','MTT123','White Toyota Camry'),
  ('sg-2','usr-1','Sarah Jenkins','+64 21 555 0888','JNK088','Black Honda Civic');

-- A welcome notification for Adam
INSERT OR IGNORE INTO notifications (id, user_id, title, body) VALUES
  ('n-1','usr-1','Welcome to Millennium Village Parking','Your app is ready. Book a visitor carpark in a few taps.');

-- System config
INSERT OR IGNORE INTO system_config (key, value) VALUES
  ('complex_name','Millennium Village'),
  ('complex_address','548 Albany Highway, Albany'),
  ('max_visitor_hours','24'),
  ('max_resident_excess_hours','12'),
  ('demerit_fine_threshold','3'),
  ('demerit_fine_amount','50'),
  ('max_weekly_rental_price','50'),
  ('total_visitor_parks','20'),
  ('spot_prefix','V'),
  ('tow_agency_name','Citywide Towing & Recovery'),
  ('tow_agency_phone','+64 9 555 8697');
