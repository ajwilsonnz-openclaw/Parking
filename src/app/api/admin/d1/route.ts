import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { queryDb, execDb, ensureSchema } from '@/lib/db';

export const runtime = 'edge';

const ALLOWED_TABLES = [
  'carparks',
  'parking_sessions',
  'whitelist',
  'users',
  'unit_vehicles',
  'demerits',
  'spot_rentals',
  'push_subscriptions',
  'system_config',
  'audit_log',
];

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const table = req.nextUrl.searchParams.get('table') || 'carparks';
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  try {
    const startTime = performance.now();
    const rows = await queryDb<any>(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 200`);
    const durationMs = Math.round(performance.now() - startTime);

    return NextResponse.json({
      table,
      count: rows.length,
      durationMs,
      rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, table, row, id, column, value, sqlQuery } = body;

  try {
    // 1. Raw SQL Query execution
    if (action === 'query') {
      if (!sqlQuery || typeof sqlQuery !== 'string') {
        return NextResponse.json({ error: 'sqlQuery required' }, { status: 400 });
      }

      const trimmed = sqlQuery.trim();
      const startTime = performance.now();

      if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA')) {
        const rows = await queryDb<any>(trimmed);
        const durationMs = Math.round(performance.now() - startTime);
        return NextResponse.json({ success: true, count: rows.length, durationMs, rows });
      } else {
        await execDb(trimmed);
        const durationMs = Math.round(performance.now() - startTime);
        return NextResponse.json({ success: true, message: 'Executed query successfully', durationMs });
      }
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    // 2. Inline cell edit
    if (action === 'update_cell') {
      if (!id || !column) {
        return NextResponse.json({ error: 'id and column required' }, { status: 400 });
      }
      await execDb(`UPDATE ${table} SET ${column} = ? WHERE id = ?`, [value, id]);
      return NextResponse.json({ success: true, message: `Updated ${column} in ${table}` });
    }

    // 3. Insert Row
    if (action === 'insert_row') {
      if (!row || typeof row !== 'object') {
        return NextResponse.json({ error: 'row data required' }, { status: 400 });
      }
      const keys = Object.keys(row);
      const values = Object.values(row);
      const placeholders = keys.map(() => '?').join(', ');
      await execDb(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      return NextResponse.json({ success: true, message: `Inserted row into ${table}` });
    }

    // 4. Delete Row
    if (action === 'delete_row') {
      if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      await execDb(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: `Deleted row ${id} from ${table}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
