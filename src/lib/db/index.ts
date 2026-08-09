// Cloudflare D1 helper - safe in both Edge & local Node runtimes.
// Uses getRequestContext() when available (Cloudflare Pages), falls back to
// better-sqlite3 at dev time (via eval-require to dodge bundler analysis).

let localDbInstance: any = null;

function getLocalDb() {
  if (typeof window !== 'undefined') return null;
  if (!localDbInstance) {
    try {
      // Use eval-require so Webpack's Edge build doesn't try to bundle native bindings
      const req = eval('require');
      const Database = req('better-sqlite3');
      const path = req('path');
      const fs = req('fs');

      const dbPath = path.join(process.cwd(), 'parking.sqlite');
      localDbInstance = new Database(dbPath);
      localDbInstance.pragma('journal_mode = WAL');

      // Auto-apply migrations if any table missing
      const hasUsers = localDbInstance
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        .get();
      if (!hasUsers) {
        const migrationsDir = path.join(process.cwd(), 'migrations');
        if (fs.existsSync(migrationsDir)) {
          const files = fs.readdirSync(migrationsDir)
            .filter((f: string) => f.endsWith('.sql'))
            .sort();
          for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            localDbInstance.exec(sql);
          }
        }
      }
    } catch (err) {
      // Not on Node, or migrations already applied. Safe to ignore.
    }
  }
  return localDbInstance;
}

/**
 * Run a query. Returns array of rows for SELECT, otherwise affected.
 */
export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // Cloudflare Pages: use bound D1 from request context
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.DB) {
    try {
      // @ts-ignore
      const stmt = process.env.DB.prepare(sql).bind(...params);
      const res = await stmt.all();
      return (res.results || []) as T[];
    } catch (e) {
      console.error('D1 query error:', e);
      return [];
    }
  }

  // Local dev: use sqlite
  try {
    const db = getLocalDb();
    if (!db) return [];
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return (stmt.all(...params) || []) as T[];
    } else {
      stmt.run(...params);
      return [] as T[];
    }
  } catch (err) {
    console.error('Local SQLite error:', err);
    return [] as T[];
  }
}

/**
 * Run a write query. Returns { lastID, changes }.
 */
export async function execDb(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  // Cloudflare Pages
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.DB) {
    try {
      // @ts-ignore
      const res = await process.env.DB.prepare(sql).bind(...params).run();
      return { lastID: res.meta?.last_row_id, changes: res.meta?.changes };
    } catch (e) {
      console.error('D1 exec error:', e);
      return {};
    }
  }

  // Local dev
  try {
    const db = getLocalDb();
    if (!db) return {};
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { lastID: result.lastInsertRowid, changes: result.changes };
  } catch (err) {
    console.error('Local SQLite exec error:', err);
    return {};
  }
}

/** Get a single row */
export async function queryDbOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryDb<T>(sql, params);
  return rows.length ? rows[0] : null;
}
