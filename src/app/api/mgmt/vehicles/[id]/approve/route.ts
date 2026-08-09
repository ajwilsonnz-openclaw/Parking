import { NextRequest, NextResponse } from 'next/server';
import { requireManagement } from '@/lib/auth';
import { execDb } from '@/lib/db';

export const runtime = 'edge';

/** POST /api/mgmt/vehicles/:id/approve */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireManagement(req);
  if (user instanceof NextResponse) return user;

  try {
    await execDb('UPDATE unit_vehicles SET status = ?, approved_by_user_id = ?, approved_at = ? WHERE id = ?', [
      'approved',
      user.id,
      new Date().toISOString(),
      params.id,
    ]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
