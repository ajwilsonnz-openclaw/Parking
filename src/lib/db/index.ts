import path from 'path';
import fs from 'fs';

let localDb: any = null;

export function getLocalDb() {
  if (typeof window !== 'undefined') return null;
  if (!localDb) {
    try {
      const Database = require('better-sqlite3');
      const dbPath = path.join(process.cwd(), 'parking.sqlite');
      localDb = new Database(dbPath);
      localDb.pragma('journal_mode = WAL');

      const tableCheck = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='whitelist'").get();
      if (!tableCheck) {
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          localDb.exec(schemaSql);
        }
      }
    } catch (err) {
      console.warn('SQLite initialization skipped or fallback active:', err);
    }
  }
  return localDb;
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // 1. Cloudflare Pages / Worker Environment with D1 binding
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.DB) {
    try {
      // @ts-ignore
      const stmt = process.env.DB.prepare(sql).bind(...params);
      const res = await stmt.all();
      return res.results as T[];
    } catch (e) {
      console.error('D1 query error:', e);
      return [];
    }
  }

  // 2. Local Node.js environment SQLite DB
  try {
    const db = getLocalDb();
    if (!db) return [];
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params) as T[];
    } else {
      stmt.run(...params);
      return [] as T[];
    }
  } catch (err) {
    console.error('Local SQLite error:', err);
    return [] as T[];
  }
}
