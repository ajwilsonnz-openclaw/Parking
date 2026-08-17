// Database helper for Cloudflare D1 (Edge) + in-memory store fallback (dev)
let schemaInitialized = false;

export const CANONICAL_SECTIONS = [
  { id: 'sec_entrance', site_id: 'site_mv', name: 'Entrance', display_order: 1, description: 'Main entrance area' },
  { id: 'sec_units_1_7', site_id: 'site_mv', name: 'Units 1–7', display_order: 2, description: 'Front townhouse wing' },
  { id: 'sec_units_8_13', site_id: 'site_mv', name: 'Units 8–13', display_order: 3, description: 'Middle townhouse wing' },
  { id: 'sec_back', site_id: 'site_mv', name: 'Back of Complex', display_order: 4, description: 'Rear courtyard area' },
];

export const CANONICAL_CARPARKS = Array.from({ length: 23 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  const sectionId = i < 3 ? 'sec_entrance' : i < 14 ? 'sec_units_1_7' : i < 20 ? 'sec_units_8_13' : 'sec_back';
  const sectionName = i < 3 ? 'Entrance' : i < 14 ? 'Units 1–7' : i < 20 ? 'Units 8–13' : 'Back of Complex';
  return {
    id: `cp_v${num}`,
    site_id: 'site_mv',
    section_id: sectionId,
    section: sectionName,
    spot_number: `V${num}`,
    status: 'available',
    is_rentable_private: 0,
    owner_unit_number: null,
  };
});

interface DevStore {
  carparks: any[];
  parking_sessions: any[];
  saved_guests: any[];
  unit_vehicles: any[];
  users: any[];
  units: any[];
  whitelist: any[];
  sections: any[];
  sites: any[];
  system_config: any[];
}

function getMemoryStore(): DevStore {
  const g = globalThis as any;
  if (!g.__dev_store__ || !g.__dev_store__.carparks || g.__dev_store__.carparks.length < 23) {
    g.__dev_store__ = {
      carparks: CANONICAL_CARPARKS.map((c) => ({ ...c })),
      parking_sessions: g.__dev_store__?.parking_sessions || [],
      saved_guests: g.__dev_store__?.saved_guests || [],
      unit_vehicles: g.__dev_store__?.unit_vehicles || [],
      users: g.__dev_store__?.users || [],
      units: g.__dev_store__?.units || [],
      whitelist: g.__dev_store__?.whitelist || [],
      sections: CANONICAL_SECTIONS.map((s) => ({ ...s })),
      sites: [{ id: 'site_mv', name: 'Millennium Village', address: '548 Albany Highway, Auckland', total_visitor_parks: 23, max_duration_hours: 24 }],
      system_config: g.__dev_store__?.system_config || [],
    };
  }
  return g.__dev_store__;
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
  try {
    const mod = Function('try { return require("@cloudflare/next-on-pages"); } catch { return null; }')();
    if (mod?.getRequestContext) {
      const ctx = mod.getRequestContext();
      if (ctx?.env?.DB) return ctx.env.DB;
    }
  } catch {}
  return null;
}

export async function ensureSchema() {
  if (schemaInitialized) return;
  schemaInitialized = true;

  try {
    const db = getD1();
    if (!db) return; // In-memory store is self-initializing

    // 1. Core table creations on Cloudflare D1
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
      CREATE TABLE IF NOT EXISTS saved_guests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        plate TEXT NOT NULL,
        make_model_color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS carparks (
        id TEXT PRIMARY KEY,
        site_id TEXT DEFAULT 'site_mv',
        section_id TEXT,
        section TEXT,
        spot_number TEXT UNIQUE NOT NULL,
        status TEXT CHECK(status IN ('available', 'occupied', 'maintenance', 'rented')) DEFAULT 'available',
        is_rentable_private INTEGER DEFAULT 0,
        owner_unit_number TEXT
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id TEXT PRIMARY KEY,
        carpark_id TEXT,
        spot_id TEXT,
        spot_number TEXT NOT NULL,
        unit_number TEXT NOT NULL,
        user_id TEXT,
        created_by_user_id TEXT,
        vehicle_plate TEXT NOT NULL,
        session_type TEXT CHECK(session_type IN ('visitor', 'resident_excess', 'rented_private')) NOT NULL,
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

    // 2. Safe Column Additions for Legacy D1 Tables
    await execDb('ALTER TABLE whitelist ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE users ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN user_id TEXT').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN status TEXT DEFAULT "approved"').catch(() => {});
    await execDb('ALTER TABLE carparks ADD COLUMN site_id TEXT DEFAULT "site_mv"').catch(() => {});
    await execDb('ALTER TABLE carparks ADD COLUMN section_id TEXT').catch(() => {});
    await execDb('ALTER TABLE carparks ADD COLUMN section TEXT').catch(() => {});

    await execDb('ALTER TABLE parking_sessions ADD COLUMN carpark_id TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN spot_id TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN user_id TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN created_by_user_id TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN visitor_name TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN visitor_phone TEXT').catch(() => {});
    await execDb('ALTER TABLE parking_sessions ADD COLUMN saved_guest_id TEXT').catch(() => {});

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

    // 4. Seed Canonical 23 Visitor Bays on D1 if missing
    const existingBays = await queryDb('SELECT COUNT(*) as count FROM carparks WHERE spot_number LIKE "V%"').catch(() => [{ count: 0 }]);
    if (!existingBays || existingBays[0]?.count < 23) {
      for (const park of CANONICAL_CARPARKS) {
        await execDb(
          'INSERT OR REPLACE INTO carparks (id, site_id, section_id, section, spot_number, status, is_rentable_private) VALUES (?,?,?,?,?,?,?)',
          [park.id, park.site_id, park.section_id, park.section, park.spot_number, park.status, park.is_rentable_private]
        ).catch(() => {});
      }
    }

    // 5. Backfill section_id and section for any existing carparks missing them
    await execDb(`
      UPDATE carparks SET section_id = 'sec_entrance', section = 'Entrance' 
      WHERE (section_id IS NULL OR section_id = '') AND (spot_number IN ('V01', 'V02', 'V03', 'V-01', 'V-02', 'V-03'));
      
      UPDATE carparks SET section_id = 'sec_units_1_7', section = 'Units 1–7' 
      WHERE (section_id IS NULL OR section_id = '') AND (spot_number IN ('V04', 'V05', 'V06', 'V07', 'V08', 'V09', 'V10', 'V11', 'V12', 'V13', 'V14', 'V-04', 'V-05', 'V-06', 'V-07', 'V-08', 'V-09', 'V-10', 'V-11', 'V-12', 'V-13', 'V-14'));
      
      UPDATE carparks SET section_id = 'sec_units_8_13', section = 'Units 8–13' 
      WHERE (section_id IS NULL OR section_id = '') AND (spot_number IN ('V15', 'V16', 'V17', 'V18', 'V19', 'V20', 'V-15', 'V-16', 'V-17', 'V-18', 'V-19', 'V-20'));
      
      UPDATE carparks SET section_id = 'sec_back', section = 'Back of Complex' 
      WHERE (section_id IS NULL OR section_id = '') AND (spot_number IN ('V21', 'V22', 'V23', 'V-21', 'V-22', 'V-23'));
    `).catch(() => {});
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

// In-Memory Database Execution
function runMemoryQuery<T>(sql: string, params: any[] = []): T[] {
  const store = getMemoryStore();
  const trimmed = sql.trim().toLowerCase();

  // Handle COUNT
  if (trimmed.includes('count(*)')) {
    const tableMatch = trimmed.match(/from\s+([a-z_]+)/i);
    const table = tableMatch ? tableMatch[1] : '';
    const items = (store as any)[table] || [];
    return [{ count: items.length }] as any;
  }

  // Handle SELECT * FROM table
  const tableMatch = trimmed.match(/from\s+([a-z_]+)/i);
  if (tableMatch) {
    const table = tableMatch[1];
    let items = ((store as any)[table] || []) as any[];

    // Filter active sessions
    if (trimmed.includes('is_active = 1')) {
      const nowIso = new Date().toISOString();
      items = items.filter((i) => i.is_active === 1 && (!i.expected_end_time || i.expected_end_time > nowIso));
    }
    if (trimmed.includes('carpark_id = ?') || trimmed.includes('spot_id = ?')) {
      const targetId = params[0];
      items = items.filter((i) => i.carpark_id === targetId || i.spot_id === targetId || i.id === targetId || i.spot_number === targetId);
    }
    if (trimmed.includes('user_id = ?')) {
      const userId = params[0];
      items = items.filter((i) => !userId || i.user_id === userId);
    }

    return items as T[];
  }

  return [];
}

function runMemoryExec(sql: string, params: any[] = []): { lastID?: number; changes?: number } {
  const store = getMemoryStore();
  const trimmed = sql.trim().toLowerCase();

  // INSERT INTO table
  const insertMatch = trimmed.match(/insert\s+(?:or\s+replace\s+)?into\s+([a-z_]+)\s*\(([^)]+)\)\s*values/i);
  if (insertMatch) {
    const table = insertMatch[1];
    const columns = insertMatch[2].split(',').map((c) => c.trim().toLowerCase());
    if (!(store as any)[table]) (store as any)[table] = [];

    const row: any = {};
    columns.forEach((col, idx) => {
      row[col] = params[idx] !== undefined ? params[idx] : null;
    });

    // Replace if id exists
    const list = (store as any)[table];
    const existingIdx = row.id ? list.findIndex((r: any) => r.id === row.id) : -1;
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...row };
    } else {
      list.push(row);
    }

    // Auto-update carpark status if booking session
    if (table === 'parking_sessions' && row.is_active) {
      store.carparks.forEach((c) => {
        if (c.id === row.carpark_id || c.id === row.spot_id || c.spot_number === row.spot_number) {
          c.status = 'occupied';
        }
      });
    }

    return { changes: 1 };
  }

  // UPDATE carparks SET status = ?
  if (trimmed.includes('update carparks set status = ?')) {
    const status = params[0];
    const targetId = params[1];
    const targetSpot = params[2] || targetId;
    store.carparks.forEach((c) => {
      if (c.id === targetId || c.spot_number === targetSpot || c.spot_number === targetId) {
        c.status = status;
      }
    });
    return { changes: 1 };
  }

  // UPDATE carparks SET status = 'available' WHERE id NOT IN (...)
  if (trimmed.includes('update carparks') && trimmed.includes("status = 'available'")) {
    const activeSessions = (store.parking_sessions || []).filter((s) => s.is_active === 1);
    const activeSpotIds = new Set(activeSessions.map((s) => s.carpark_id || s.spot_id || s.spot_number));
    store.carparks.forEach((c) => {
      if (!activeSpotIds.has(c.id) && !activeSpotIds.has(c.spot_number)) {
        c.status = 'available';
      }
    });
    return { changes: 1 };
  }

  // Auto-expire parking sessions
  if (trimmed.includes('update parking_sessions') && trimmed.includes('is_active = 0')) {
    const nowIso = new Date().toISOString();
    store.parking_sessions.forEach((s) => {
      if (s.expected_end_time && s.expected_end_time <= nowIso) {
        s.is_active = 0;
        s.end_time = s.expected_end_time;
      }
    });
    return { changes: 1 };
  }

  // DELETE FROM saved_guests WHERE id = ?
  if (trimmed.includes('delete from saved_guests')) {
    const targetId = params[0];
    store.saved_guests = store.saved_guests.filter((g) => g.id !== targetId);
    return { changes: 1 };
  }

  return { changes: 1 };
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (getD1()) return runD1<T>(sql, params);
  return runMemoryQuery<T>(sql, params);
}

export async function execDb(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  if (getD1()) return execD1(sql, params);
  return runMemoryExec(sql, params);
}

export async function queryDbOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryDb<T>(sql, params);
  return rows.length ? rows[0] : null;
}
