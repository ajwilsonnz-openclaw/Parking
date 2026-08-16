// Database helper for Cloudflare D1 (Edge) + local better-sqlite3 (dev)
let localDbInstance: any = null;
let schemaInitialized = false;

function getLocalDb() {
  if (typeof window !== 'undefined') return null;
  if (!localDbInstance) {
    try {
      const req = eval('require');
      const Database = req('better-sqlite3');
      const path = req('path');
      const fs = req('fs');

      const dbPath = path.join(process.cwd(), 'parking.sqlite');
      localDbInstance = new Database(dbPath);
      localDbInstance.pragma('journal_mode = WAL');

      // Auto-apply migrations if needed
      const migrationsDir = path.join(process.cwd(), 'migrations');
      if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir)
          .filter((f: string) => f.endsWith('.sql'))
          .sort();
        for (const file of files) {
          try {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            localDbInstance.exec(sql);
          } catch {}
        }
      }
    } catch (err) {}
  }
  return localDbInstance;
}

function getD1(): any {
  try {
    const ctx = (globalThis as any).getRequestContext?.();
    if (ctx?.env?.DB) return ctx.env.DB;
  } catch {}
  try {
    if ((globalThis as any).DB) return (globalThis as any).DB;
  } catch {}
  try {
    if ((process.env as any).DB) return (process.env as any).DB;
  } catch {}
  return null;
}

export async function ensureSchema() {
  if (schemaInitialized) return;
  schemaInitialized = true;

  try {
    // 1. Core table creations
    await execDb(`
      CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        unit_number TEXT UNIQUE NOT NULL,
        assigned_parks INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        unit_number TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        assigned_parks INTEGER DEFAULT 1,
        added_by_user_id TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS unit_vehicles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        unit_number TEXT NOT NULL,
        plate_number TEXT NOT NULL,
        make_model_color TEXT,
        is_primary INTEGER DEFAULT 0,
        status TEXT DEFAULT 'approved',
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        unit_number TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        assigned_parks INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        total_visitor_parks INTEGER DEFAULT 23,
        max_duration_hours INTEGER DEFAULT 24,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    // 2. Safe Column Additions for Legacy Tables
    await execDb('ALTER TABLE whitelist ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE users ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN user_id TEXT').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN status TEXT DEFAULT "approved"').catch(() => {});
    await execDb('ALTER TABLE carparks ADD COLUMN site_id TEXT DEFAULT "site_mv"').catch(() => {});
    await execDb('ALTER TABLE carparks ADD COLUMN section_id TEXT').catch(() => {});

    // 3. Seed Default Site & Sections if not present
    await execDb(`
      INSERT OR REPLACE INTO sites (id, name, address, total_visitor_parks, max_duration_hours) VALUES
      ('site_mv', 'Millennium Village', '548 Albany Highway, Auckland', 23, 24);

      INSERT OR REPLACE INTO sections (id, site_id, name, display_order, description) VALUES
      ('sec_entrance', 'site_mv', 'Entrance', 1, 'Main entrance area'),
      ('sec_units_1_7', 'site_mv', 'Units 1–7', 2, 'Front townhouse wing'),
      ('sec_units_8_13', 'site_mv', 'Units 8–13', 3, 'Middle townhouse wing'),
      ('sec_back', 'site_mv', 'Back of Complex', 4, 'Rear courtyard area');
    `).catch(() => {});

    // 4. Seed Canonical 23 Visitor Bays if missing
    const existingBays = await queryDb('SELECT COUNT(*) as count FROM carparks WHERE spot_number LIKE "V%"').catch(() => [{ count: 0 }]);
    if (!existingBays || existingBays[0]?.count < 23) {
      await execDb(`
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
      `).catch(() => {});
    }
  } catch (err) {
    console.warn('[ensureSchema warning]:', err);
  }
}

async function runD1<T>(sql: string, params: any[]): Promise<T[]> {
  const db = getD1();
  if (!db) return [];
  const res = await db.prepare(sql).bind(...params).all();
  return (res.results || []) as T[];
}

async function execD1(sql: string, params: any[]): Promise<{ lastID?: number; changes?: number }> {
  const db = getD1();
  if (!db) return {};
  const res = await db.prepare(sql).bind(...params).run();
  return { lastID: res.meta?.last_row_id, changes: res.meta?.changes };
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (getD1()) return runD1<T>(sql, params);
  const db = getLocalDb();
  if (!db) return [];
  const stmt = db.prepare(sql);
  return (stmt.all(...params) || []) as T[];
}

export async function execDb(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  if (getD1()) return execD1(sql, params);
  const db = getLocalDb();
  if (!db) return {};
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { lastID: result.lastInsertRowid as number, changes: result.changes };
}

export async function queryDbOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryDb<T>(sql, params);
  return rows.length ? rows[0] : null;
}
