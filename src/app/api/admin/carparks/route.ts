import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireManagement } from '@/lib/auth';
import { queryDb, execDb, ensureSchema, CANONICAL_CARPARKS, CANONICAL_SECTIONS } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireManagement(req);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const carparks = await queryDb('SELECT * FROM carparks ORDER BY spot_number DESC');
  const sections = await queryDb('SELECT * FROM sections ORDER BY display_order ASC').catch(() => CANONICAL_SECTIONS);

  return NextResponse.json({ carparks, sections });
}

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden. Admin privileges required' }, { status: 403 });
  }

  const body = await req.json();

  // 1-tap Reset to Canonical 23 Visitor Bays
  if (body.action === 'reset_canonical') {
    // Delete existing carparks and sections
    await execDb('DELETE FROM carparks');
    await execDb('DELETE FROM sections').catch(() => {});

    // Re-insert canonical sections
    for (const sec of CANONICAL_SECTIONS) {
      await execDb(
        'INSERT OR REPLACE INTO sections (id, site_id, name, display_order, description) VALUES (?,?,?,?,?)',
        [sec.id, sec.site_id, sec.name, sec.display_order, sec.description || '']
      ).catch(() => {});
    }

    // Re-insert canonical carparks (23 down to 01)
    for (const cp of CANONICAL_CARPARKS) {
      await execDb(
        'INSERT OR REPLACE INTO carparks (id, site_id, section_id, section, spot_number, status, is_rentable_private) VALUES (?,?,?,?,?,?,?)',
        [cp.id, cp.site_id, cp.section_id, cp.section, cp.spot_number, 'available', 0]
      );
    }

    return NextResponse.json({ success: true, message: 'Reset to canonical 23 visitor carparks successfully' });
  }

  const { id, spot_number, section_id, section, status, is_rentable_private } = body;
  if (!spot_number) return NextResponse.json({ error: 'Spot number required' }, { status: 400 });

  const cleanSpot = String(spot_number).trim().toUpperCase();
  const cleanSection = section || 'Entrance';
  const cleanSectionId = section_id || 'sec_entrance';
  const cleanStatus = status || 'available';
  const rentable = is_rentable_private ? 1 : 0;

  const existing = await queryDb('SELECT id FROM carparks WHERE spot_number = ? OR id = ?', [cleanSpot, id || cleanSpot]);
  if (existing.length > 0) {
    await execDb(
      'UPDATE carparks SET spot_number = ?, section = ?, section_id = ?, status = ?, is_rentable_private = ? WHERE id = ? OR spot_number = ?',
      [cleanSpot, cleanSection, cleanSectionId, cleanStatus, rentable, existing[0].id, cleanSpot]
    );
  } else {
    const cpId = id || `cp_${cleanSpot.toLowerCase()}`;
    await execDb(
      'INSERT INTO carparks (id, site_id, section_id, section, spot_number, status, is_rentable_private) VALUES (?,?,?,?,?,?,?)',
      [cpId, 'site_mv', cleanSectionId, cleanSection, cleanSpot, cleanStatus, rentable]
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema().catch(() => {});

  const user = await requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden. Admin privileges required' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await execDb('DELETE FROM carparks WHERE id = ? OR spot_number = ?', [id, id]);
  return NextResponse.json({ success: true });
}
