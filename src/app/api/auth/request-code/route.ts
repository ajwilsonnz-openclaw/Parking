import { NextRequest, NextResponse } from 'next/server';
import {
  createOtp,
  getWhitelistEntry,
  findUserByEmail,
} from '@/lib/auth';

export const runtime = 'edge';

/**
 * POST /api/auth/request-code
 * Body: { email }
 * Sends a 6-digit code to the email if whitelisted or an existing user.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const normalized = String(email).trim().toLowerCase();
    const existingUser = await findUserByEmail(normalized);
    const whitelistEntry = await getWhitelistEntry(normalized);

    if (!existingUser && !whitelistEntry) {
      // Don't leak whether email exists
      return NextResponse.json({ error: 'If this email has been invited, a code will be sent.' }, { status: 200 });
    }

    const code = await createOtp(normalized);

    // Send email via Cloudflare send_email binding if configured
    try {
      const env = (globalThis as any).getRequestContext?.()?.env || process.env;
      const sender = env.MAIL;
      if (sender?.send) {
        await sender.send({
          from: env.MAIL_FROM || 'Millennium Village Parking <noreply@millennium-village.nz>',
          to: normalized,
          subject: 'Your Millennium Village Parking login code',
          text: `Your 6-digit code is: ${code}\n\n(This code expires in 10 minutes. If you didn't request it, ignore this email.)`,
        });
      } else {
        // Development fallback: log the code so devs can sign in without email
        console.log(`[mail] Magic link code for ${normalized}: ${code}`);
      }
    } catch (mailErr) {
      console.error('Mail send error (falling back to console):', mailErr);
      console.log(`[mail] Magic link code for ${normalized}: ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
