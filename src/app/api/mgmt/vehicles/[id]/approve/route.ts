import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { execDb } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireManagement();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await execDb(
    "UPDATE unit_vehicles SET status = 'approved', approved_by_user_id = ?, approved_at = datetime('now') WHERE id = ?",
    [user.id, params.id]
  );
  return NextResponse.json({ success: true });
}
