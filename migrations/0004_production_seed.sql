-- Production seed: 20 visitor carparks (all available) + system_config defaults
-- No demo users, sessions, or demerits

-- 20 visitor carparks (V01…V20), all available
INSERT OR IGNORE INTO carparks (id, spot_number, section, status, is_rentable_private) VALUES
  ('cp-01','V01','','available',0),
  ('cp-02','V02','','available',0),
  ('cp-03','V03','','available',0),
  ('cp-04','V04','','available',0),
  ('cp-05','V05','','available',0),
  ('cp-06','V06','','available',0),
  ('cp-07','V07','','available',0),
  ('cp-08','V08','','available',0),
  ('cp-09','V09','','available',0),
  ('cp-10','V10','','available',0),
  ('cp-11','V11','','available',0),
  ('cp-12','V12','','available',0),
  ('cp-13','V13','','available',0),
  ('cp-14','V14','','available',0),
  ('cp-15','V15','','available',0),
  ('cp-16','V16','','available',0),
  ('cp-17','V17','','available',0),
  ('cp-18','V18','','available',0),
  ('cp-19','V19','','available',0),
  ('cp-20','V20','','available',0);

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
