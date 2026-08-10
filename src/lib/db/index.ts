// Database helper for Cloudflare D1 (Edge) + local better-sqlite3 (dev)
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

      // Auto-apply migrations if needed
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
