-- Wipe all runtime data (keeps system_config). Keeps users to allow relogin.
-- Run with: npm run db:reset

DELETE FROM notifications;
DELETE FROM saved_guests;
DELETE FROM demerits;
DELETE FROM spot_rentals;
DELETE FROM otp_codes;
DELETE FROM auth_sessions;
DELETE FROM parking_sessions;
DELETE FROM unit_vehicles;
DELETE FROM carparks;
-- Optionally uncomment to fully wipe users (they'd need whitelisting again)
-- DELETE FROM users;
-- DELETE FROM whitelist;
