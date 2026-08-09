-- WebAuthn passkeys (FaceID / TouchID / screen-lock) and one-time ceremony challenges

CREATE TABLE IF NOT EXISTS passkey_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT,
  device_label TEXT,
  platform TEXT,
  aaguid TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_passkey_user ON passkey_credentials(user_id);

CREATE TABLE IF NOT EXISTS auth_challenges (
  id TEXT PRIMARY KEY,
  kind TEXT CHECK(kind IN ('reg','auth')) NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  challenge TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_challenges_user ON auth_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_email ON auth_challenges(email);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON auth_challenges(expires_at);
