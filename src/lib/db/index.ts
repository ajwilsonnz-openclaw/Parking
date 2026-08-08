// Cloudflare D1 & Local SQLite Database Query Helper
let localDbInstance: any = null;

function getLocalDb() {
  if (typeof window !== 'undefined') return null;
  if (!localDbInstance) {
    try {
      // Use eval require to prevent Webpack Edge bundler from analyzing node-native dependencies
      const req = eval('require');
      const Database = req('better-sqlite3');
      const path = req('path');
      const fs = req('fs');

      const dbPath = path.join(process.cwd(), 'parking.sqlite');
      localDbInstance = new Database(dbPath);
      localDbInstance.pragma('journal_mode = WAL');

      const tableCheck = localDbInstance.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='whitelist'").get();
      if (!tableCheck) {
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          localDbInstance.exec(schemaSql);
        }
      }
    } catch (err) {
      // Skipped safely in Cloudflare Edge Runtime
    }
  }
  return localDbInstance;
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // 1. Cloudflare Pages / Worker Edge Runtime environment with D1 binding
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.DB) {
    try {
      // @ts-ignore
      const stmt = process.env.DB.prepare(sql).bind(...params);
      const res = await stmt.all();
      return (res.results || []) as T[];
    } catch (e) {
      console.error('Cloudflare D1 query error:', e);
      return [];
    }
  }

  // 2. Local Node environment fallback
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
