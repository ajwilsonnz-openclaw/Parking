'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';
import { Building2, Mail, Loader2, Fingerprint, AlertCircle } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useSignIn, useClerk } from '@clerk/nextjs';

type Stage = 'email' | 'code';

export default function LoginViewClerk() {
  const { refetch } = useApp();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the Clerk session is already active, ClerkSyncHandler (mounted above)
  // completes the D1 handoff. Nothing extra to track here.

  // ─── Passkey login ──────────────────────────────────────────────
  async function handlePasskeyLogin() {
    setPasskeyLoading(true);
    setError(null);
    try {
      const optRes = await fetch('/api/auth/passkeys/login-options', { method: 'POST' });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error || 'Failed to get options');

      const assertion = await startAuthentication(optData.options as any);

      const verRes = await fetch('/api/auth/passkeys/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: optData.challengeId, assertion }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error || 'Passkey failed');
      await refetch();
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('FaceID / fingerprint was cancelled or unavailable.');
      } else {
        setError(err.message || 'Passkey sign-in failed. Try email instead.');
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  // ─── Email code flow (two steps) ────────────────────────────────
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError(null);
    try {
      // Use the two-step Clerk email-code flow:
      // 1) create sign-in attempt
      const attempt = await signIn.create({
        identifier: email,
      });
      // 2) explicit Prepare First Factor: send email_code to the email
      const prep = await (attempt as any).prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: (attempt as any).identifier?.emailAddressId || undefined,
      });
      if (prep.status === 'needs_first_factor') {
        setStage('code');
      } else {
        throw new Error('Unexpected status: ' + prep.status);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Failed to send code. Is that email whitelisted?');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError(null);
    try {
      const result = await (signIn as any).attemptFirstFactor({
        strategy: 'email_code',
        code: code.trim(),
      });
      if (result.status === 'complete') {
        // Let ClerkSyncHandler (and the useEffect) handle the session sync and UI switch
      } else {
        throw new Error('Code not accepted. Status: ' + result.status);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] flex items-center justify-center shadow-xl shadow-blue-600/30 mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">
            Millennium Village Parking
          </h1>
          <p className="text-sm text-ink-secondary mt-1.5">
            Book visitor & resident carparks in a few taps.
          </p>
        </div>

        <div className="card p-8 space-y-6">
          <button
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {passkeyLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Waiting for FaceID...
              </>
            ) : (
              <>
                <Fingerprint className="w-6 h-6" />
                Sign in with biometric
              </>
            )}
          </button>

          <div className="relative text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative bg-bg-surface px-3 text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
              or continue with email
            </span>
          </div>

          {stage === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11 py-3 text-base"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-ink">Check your email</h2>
                <p className="text-sm text-ink-secondary mt-1">
                  We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
                  6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input py-3 text-center text-2xl font-black tracking-[0.4em] font-mono"
                  placeholder="------"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & sign in'}
              </button>
              <button
                type="button"
                onClick={() => { setStage('email'); setCode(''); setError(null); }}
                className="btn-ghost w-full text-sm"
              >
                Use a different email
              </button>
            </form>
          )}

          {error && (
            <div className="card p-3 text-xs flex items-start gap-2 text-ink" style={{ backgroundColor: 'var(--danger-soft)', borderColor: 'var(--danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-px text-danger" />
              <span className="text-danger">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
