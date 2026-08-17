// Database helper for Cloudflare D1 (Edge) + fully-featured in-memory store fallback (dev)
let schemaInitialized = false;

export const CANONICAL_SECTIONS = [
  { id: 'sec_entrance', site_id: 'site_mv', name: 'Entrance', display_order: 1, description: 'Main entrance area' },
  { id: 'sec_units_8_13', site_id: 'site_mv', name: 'Units 8–13', display_order: 2, description: 'Middle townhouse wing' },
  { id: 'sec_units_1_7', site_id: 'site_mv', name: 'Units 1–7', display_order: 3, description: 'Front townhouse wing' },
  { id: 'sec_back', site_id: 'site_mv', name: 'Back of Complex', display_order: 4, description: 'Rear courtyard area' },
];

export const CANONICAL_CARPARKS = Array.from({ length: 23 }, (_, i) => {
  const spotNum = 23 - i; // 23 starts at entrance, down to 01
  const num = spotNum.toString().padStart(2, '0');
  const sectionId = spotNum >= 21 ? 'sec_entrance' : spotNum >= 15 ? 'sec_units_8_13' : spotNum >= 4 ? 'sec_units_1_7' : 'sec_back';
  const sectionName = spotNum >= 21 ? 'Entrance' : spotNum >= 15 ? 'Units 8–13' : spotNum >= 4 ? 'Units 1–7' : 'Back of Complex';
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

export const DEFAULT_WHITELIST = [
  { id: 'wl-aj', email: 'ajwilsonnz@gmail.com', name: 'Adam Wilson', unit_number: 'Unit 5', phone: '+64 21 000 0000', role: 'admin', assigned_parks: 1, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
  { id: 'wl-1', email: 'resident@millennium.com', name: 'Adam Miller', unit_number: 'Unit 12', phone: '+64 21 555 0192', role: 'user', assigned_parks: 1, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
  { id: 'wl-2', email: 'manager@millennium.com', name: 'Sarah Jenkins', unit_number: 'Unit 1', phone: '+64 21 555 0888', role: 'management', assigned_parks: 2, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
  { id: 'wl-3', email: 'admin@millennium.com', name: 'BodyCorp Admin', unit_number: 'Unit 5', phone: '+64 21 555 0999', role: 'admin', assigned_parks: 1, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
  { id: 'wl-4', email: 'unit8@millennium.com', name: 'David Chen', unit_number: 'Unit 8', phone: '+64 21 555 0441', role: 'user', assigned_parks: 1, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
  { id: 'wl-5', email: 'unit27@millennium.com', name: 'Emma Williams', unit_number: 'Unit 27', phone: '+64 21 555 0772', role: 'user', assigned_parks: 1, added_by_user_id: 'usr-aj', added_at: new Date().toISOString() },
];

export const DEFAULT_USERS = [
  { id: 'usr-aj', email: 'ajwilsonnz@gmail.com', name: 'Adam Wilson', unit_number: 'Unit 5', phone: '+64 21 000 0000', role: 'admin', status: 'active', assigned_parks: 1, created_at: new Date().toISOString() },
  { id: 'usr-1', email: 'resident@millennium.com', name: 'Adam Miller', unit_number: 'Unit 12', phone: '+64 21 555 0192', role: 'user', status: 'active', assigned_parks: 1, created_at: new Date().toISOString() },
  { id: 'usr-2', email: 'manager@millennium.com', name: 'Sarah Jenkins', unit_number: 'Unit 1', phone: '+64 21 555 0888', role: 'management', status: 'active', assigned_parks: 2, created_at: new Date().toISOString() },
  { id: 'usr-3', email: 'admin@millennium.com', name: 'BodyCorp Admin', unit_number: 'Unit 5', phone: '+64 21 555 0999', role: 'admin', status: 'active', assigned_parks: 1, created_at: new Date().toISOString() },
  { id: 'usr-4', email: 'unit8@millennium.com', name: 'David Chen', unit_number: 'Unit 8', phone: '+64 21 555 0441', role: 'user', status: 'active', assigned_parks: 1, created_at: new Date().toISOString() },
  { id: 'usr-5', email: 'unit27@millennium.com', name: 'Emma Williams', unit_number: 'Unit 27', phone: '+64 21 555 0772', role: 'user', status: 'active', assigned_parks: 1, created_at: new Date().toISOString() },
];

export const DEFAULT_UNITS = Array.from({ length: 27 }, (_, i) => ({
  id: `unit-${i + 1}`,
  unit_number: `Unit ${i + 1}`,
  assigned_parks: i === 0 ? 2 : 1,
  notes: `Townhouse ${i + 1}`,
  created_at: new Date().toISOString(),
}));

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
  demerits: any[];
  spot_rentals: any[];
  notifications: any[];
}

function getMemoryStore(): DevStore {
  const g = globalThis as any;
  if (!g.__dev_store__ || !g.__dev_store__.carparks || g.__dev_store__.carparks.length < 23) {
    g.__dev_store__ = {
      carparks: CANONICAL_CARPARKS.map((c) => ({ ...c })),
      parking_sessions: [
        {
          id: 'sess-1',
          carpark_id: 'cp_v21',
          spot_number: 'V21',
          user_id: 'usr-1',
          unit_number: 'Unit 12',
          vehicle_plate: 'GHJ125',
          session_type: 'visitor',
          start_time: new Date(Date.now() - 2 * 3600000).toISOString(),
          expected_end_time: new Date(Date.now() + 4 * 3600000).toISOString(),
          is_active: 1,
          visitor_name: 'Mark Taylor',
          visitor_phone: '+64 21 555 9911',
        },
      ],
      saved_guests: [
        { id: 'sg-1', user_id: 'usr-1', name: 'Mark Taylor', phone: '+64 21 555 9911', plate: 'GHJ125', make_model_color: 'White Tesla Model 3' },
      ],
      unit_vehicles: [
        { id: 'v-1', user_id: 'usr-aj', unit_number: 'Unit 5', plate_number: 'HZZ303', make_model_color: 'Grey Sedan', is_primary: 1, status: 'approved' },
        { id: 'v-2', user_id: 'usr-1', unit_number: 'Unit 12', plate_number: 'GHJ125', make_model_color: 'White Tesla Model 3', is_primary: 1, status: 'approved' },
      ],
      users: DEFAULT_USERS.map((u) => ({ ...u })),
      units: DEFAULT_UNITS.map((u) => ({ ...u })),
      whitelist: DEFAULT_WHITELIST.map((w) => ({ ...w })),
      sections: CANONICAL_SECTIONS.map((s) => ({ ...s })),
      sites: [{ id: 'site_mv', name: 'Millennium Village', address: '548 Albany Highway, Auckland', total_visitor_parks: 23, max_duration_hours: 24 }],
      system_config: [
        { key: 'complex_name', value: 'Millennium Village' },
        { key: 'max_visitor_hours', value: '24' },
        { key: 'max_resident_excess_hours', value: '12' },
        { key: 'demerit_fine_threshold', value: '3' },
        { key: 'demerit_fine_amount', value: '50' },
        { key: 'total_visitor_parks', value: '23' },
        { key: 'spot_prefix', value: 'V' },
      ],
      demerits: [
        { id: 'dem-1', unit_number: 'Unit 8', user_id: 'usr-4', vehicle_plate: 'PQR334', spot_number: 'V05', violation_type: 'overtime', description: 'Overstayed 24-hr guest window.', demerit_points: 1, fine_amount: 0, status: 'issued', created_at: new Date().toISOString() },
      ],
      spot_rentals: [],
      notifications: [
        { id: 'n-1', user_id: 'usr-aj', title: 'Welcome to Millennium Village Parking', body: 'Your unit (Unit 5) has administrator privileges.', created_at: new Date().toISOString() },
      ],
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
      CREATE TABLE IF NOT EXISTS carparks (
        id TEXT PRIMARY KEY,
        site_id TEXT DEFAULT 'site_mv',
        section_id TEXT,
        section TEXT,
        spot_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        is_rentable_private INTEGER DEFAULT 0,
        owner_unit_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    await execDb(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id TEXT PRIMARY KEY,
        carpark_id TEXT,
        spot_id TEXT,
        spot_number TEXT NOT NULL,
        user_id TEXT,
        created_by_user_id TEXT,
        unit_number TEXT NOT NULL,
        vehicle_plate TEXT NOT NULL,
        session_type TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        expected_end_time DATETIME NOT NULL,
        end_time DATETIME,
        is_active INTEGER NOT NULL DEFAULT 1,
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

    // Seed Canonical 23 Visitor Bays on D1 if missing
    const existingBays = await queryDb('SELECT COUNT(*) as count FROM carparks WHERE spot_number LIKE "V%"').catch(() => [{ count: 0 }]);
    if (!existingBays || existingBays[0]?.count < 23) {
      for (const park of CANONICAL_CARPARKS) {
        await execDb(
          'INSERT OR REPLACE INTO carparks (id, site_id, section_id, section, spot_number, status, is_rentable_private) VALUES (?,?,?,?,?,?,?)',
          [park.id, park.site_id, park.section_id, park.section, park.spot_number, park.status, park.is_rentable_private]
        ).catch(() => {});
      }
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

// In-Memory Database Execution
function runMemoryQuery<T>(sql: string, params: any[] = []): T[] {
  const store = getMemoryStore();
  const trimmed = sql.trim().toLowerCase();

  // Handle COUNT
  if (trimmed.includes('count(*)')) {
    const tableMatch = trimmed.match(/from\s+([a-z_]+)/i);
    const table = tableMatch ? tableMatch[1].toLowerCase() : '';
    const items = (store as any)[table] || [];
    return [{ count: items.length }] as any;
  }

  // Handle SELECT * FROM table
  const tableMatch = trimmed.match(/from\s+([a-z_]+)/i);
  if (tableMatch) {
    const table = tableMatch[1].toLowerCase();
    let items = ((store as any)[table] || []) as any[];

    // Filter active sessions
    if (trimmed.includes('is_active = 1')) {
      const nowIso = new Date().toISOString();
      items = items.filter((i) => i.is_active === 1 && (!i.expected_end_time || i.expected_end_time > nowIso));
    }

    // Filter by LOWER(email) = LOWER(?)
    if (trimmed.includes('lower(email) = lower(?)') || trimmed.includes('email = ?')) {
      const email = String(params[0] || '').toLowerCase();
      items = items.filter((i) => String(i.email || '').toLowerCase() === email);
    }

    // Filter by spot_number or carpark_id
    if (trimmed.includes('carpark_id = ?') || trimmed.includes('spot_id = ?')) {
      const targetId = params[0];
      items = items.filter((i) => i.carpark_id === targetId || i.spot_id === targetId || i.id === targetId || i.spot_number === targetId);
    }

    // Filter by user_id
    if (trimmed.includes('user_id = ?')) {
      const userId = params[0];
      items = items.filter((i) => !userId || i.user_id === userId);
    }

    // Filter by unit_number
    if (trimmed.includes('unit_number = ?')) {
      const unit = params[0];
      items = items.filter((i) => !unit || i.unit_number === unit);
    }

    // Filter by id = ?
    if (trimmed.includes('id = ?')) {
      const id = params[0];
      items = items.filter((i) => i.id === id);
    }

    return items as T[];
  }

  return [];
}

function runMemoryExec(sql: string, params: any[] = []): { lastID?: number; changes?: number } {
  const store = getMemoryStore();
  const trimmed = sql.trim().toLowerCase();

  // INSERT INTO table
  const insertMatch = trimmed.match(/insert\s+(?:or\s+replace\s+|or\s+ignore\s+)?into\s+([a-z_]+)\s*\(([^)]+)\)\s*values/i);
  if (insertMatch) {
    const table = insertMatch[1].toLowerCase();
    const columns = insertMatch[2].split(',').map((c) => c.trim().toLowerCase());
    if (!(store as any)[table]) (store as any)[table] = [];

    const row: any = {};
    columns.forEach((col, idx) => {
      row[col] = params[idx] !== undefined ? params[idx] : null;
    });

    const list = (store as any)[table];
    const existingIdx = row.id
      ? list.findIndex((r: any) => r.id === row.id)
      : row.email
      ? list.findIndex((r: any) => String(r.email).toLowerCase() === String(row.email).toLowerCase())
      : -1;

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

  // UPDATE table SET ... WHERE ...
  const updateMatch = trimmed.match(/update\s+([a-z_]+)\s+set\s+(.+)\s+where\s+(.+)/i);
  if (updateMatch) {
    const table = updateMatch[1].toLowerCase();
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3];
    const list = (store as any)[table] || [];

    if (whereClause.includes('lower(email) = lower(?)') || whereClause.includes('email = ?')) {
      const emailParam = String(params[params.length - 1] || '').toLowerCase();
      list.forEach((item: any) => {
        if (String(item.email || '').toLowerCase() === emailParam) {
          const assignments = setClause.split(',').map((a) => a.trim());
          assignments.forEach((assign, idx) => {
            const col = assign.split('=')[0].trim().toLowerCase();
            if (params[idx] !== undefined) item[col] = params[idx];
          });
        }
      });
      return { changes: 1 };
    }

    if (whereClause.includes('id = ?')) {
      const idParam = params[params.length - 1];
      list.forEach((item: any) => {
        if (item.id === idParam) {
          const assignments = setClause.split(',').map((a) => a.trim());
          assignments.forEach((assign, idx) => {
            const col = assign.split('=')[0].trim().toLowerCase();
            if (params[idx] !== undefined) item[col] = params[idx];
          });
        }
      });
      return { changes: 1 };
    }
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

  // DELETE FROM table WHERE ...
  const deleteMatch = trimmed.match(/delete\s+from\s+([a-z_]+)\s+where\s+(.+)/i);
  if (deleteMatch) {
    const table = deleteMatch[1].toLowerCase();
    const whereClause = deleteMatch[2];
    const target = params[0];

    if ((store as any)[table]) {
      if (whereClause.includes('id = ?')) {
        (store as any)[table] = (store as any)[table].filter((item: any) => item.id !== target);
      } else if (whereClause.includes('email = ?') || whereClause.includes('lower(email)')) {
        (store as any)[table] = (store as any)[table].filter(
          (item: any) => String(item.email || '').toLowerCase() !== String(target || '').toLowerCase()
        );
      }
    }
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
