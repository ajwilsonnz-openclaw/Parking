// Cloudflare D1 helper - works on both Pages Functions (Edge) and local dev (Node).
//
// Two runtime branches:
//   - Cloudflare Pages: `process.env.DB` is a D1Database binding provided by the Pages
//     integration. All methods are awaited promises.
//   - Local dev: falls back to `parking.sqlite` in the project root via better-sqlite3
//     loaded through eval-require (broken-out-of-bundle so Next Edge doesn't try to
//     analyse 'fs'/'path'/'better-sqlite3' as edge modules).

let localDbInstance: any = null;

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

      // Auto-apply migrations if any table is missing
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
      // Safe to ignore: we're on Edge or migrations already applied
    }
  }
  return localDbInstance;
}

function getD1(): any {
  // Primary: Pages Functions request context binding
  try {
    // @ts-ignore — Cloudflare Pages injects this via @cloudflare/next-on-pages
    const ctx = (globalThis as any).getRequestContext?.();
    if (ctx?.env?.DB) return ctx.env.DB;
  } catch {}
  // Fallback: global scope (some Wrangler setups)
  try {
    // @ts-ignore
    if ((globalThis as any).DB) return (globalThis as any).DB;
  } catch {}
  return null;
}

async function runD1<T>(sql: string, params: any[]): Promise<T[]> {
  const db = getD1();
  if (!db) return [];
  try {
    const res = await db.prepare(sql).bind(...params).all();
    return (res.results || []) as T[];
  } catch (e) {
    console.error('D1 query error:', e);
    return [];
  }
}

async function execD1(sql: string, params: any[]): Promise<{ lastID?: number; changes?: number }> {
  const db = getD1();
  if (!db) return {};
  try {
    const res = await db.prepare(sql).bind(...params).run();
    return { lastID: res.meta?.last_row_id, changes: res.meta?.changes };
  } catch (e) {
    console.error('D1 exec error:', e);
    return {};
  }
}

// ─── Public API ───────────────────────────────────────────

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (getD1()) return runD1<T>(sql, params);
  try {
    const db = getLocalDb();
    if (!db) return [];
    const stmt = db.prepare(sql);
    return (stmt.all(...params) || []) as T[];
  } catch (err) {
    console.error('Local SQLite error:', err);
    return [];
  }
}

export async function execDb(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  if (getD1()) return execD1(sql, params);
  try {
    const db = getLocalDb();
    if (!db) return {};
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { lastID: result.lastInsertRowid as number, changes: result.changes };
  } catch (err) {
    console.error('Local SQLite exec error:', err);
    return {};
  }
}

export async function queryDbOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryDb<T>(sql, params);
  return rows.length ? rows[0] : null;
}
