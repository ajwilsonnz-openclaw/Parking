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
    const req = eval('require');
    const { getRequestContext } = req('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    if (ctx?.env?.DB) return ctx.env.DB;
  } catch {}
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

    // 2. Safe Column Additions for Legacy Tables
    await execDb('ALTER TABLE whitelist ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE users ADD COLUMN assigned_parks INTEGER DEFAULT 1').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN user_id TEXT').catch(() => {});
    await execDb('ALTER TABLE unit_vehicles ADD COLUMN status TEXT DEFAULT "approved"').catch(() => {});
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
