import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const whitelist = await queryDb('SELECT * FROM whitelist ORDER BY added_at DESC');
    const vehicles = await queryDb('SELECT * FROM unit_vehicles');
    const carparks = await queryDb('SELECT * FROM carparks');
    const sessions = await queryDb('SELECT * FROM parking_sessions WHERE is_active = 1');
    const demerits = await queryDb('SELECT * FROM demerits ORDER BY created_at DESC');
    const rentals = await queryDb('SELECT * FROM spot_rentals');
    const configRows = await queryDb('SELECT * FROM system_config');

    const configMap: Record<string, any> = {};
    configRows.forEach((row: any) => {
      configMap[row.key] = row.value;
    });

    return NextResponse.json({
      whitelist,
      vehicles,
      carparks,
      sessions,
      demerits,
      rentals,
      config: configMap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
