'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';
import { Building2, Fingerprint, Loader2, Mail, AlertCircle } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';

// Lazily load the Clerk-backed login form. Only evaluated client-side at runtime.
const LoginViewClerk = dynamic(() => import('./LoginViewClerk'), { ssr: false });

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type Stage = 'home' | 'email';

export default function LoginView() {
  return hasClerk ? <LoginViewClerk /> : <LoginViewFallback />;
}

function LoginViewFallback() {
  const { refetch } = useApp();
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('home');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">Millennium Village Parking</h1>
          <p className="text-sm text-ink-secondary mt-1.5">Book visitor & resident carparks in a few taps.</p>
        </div>

        <div className="card p-8 space-y-6">
          <PasskeyButton loading={passkeyLoading} onClick={handlePasskeyLogin} />

          <div className="relative text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative bg-bg-surface px-3 text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
              or continue with email
            </span>
          </div>

          {stage === 'home' ? (
            <button onClick={() => setStage('email')} className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Email me a code
            </button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setError('Clerk not configured. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .dev.vars.'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                  <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11 py-3 text-base" placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5">Send code</button>
              <button type="button" onClick={() => setStage('home')} className="btn-ghost w-full text-sm">Go back</button>
            </form>
          )}

          {error && (
            <div className="card p-3 text-xs flex items-start gap-2" style={{ backgroundColor: 'var(--danger-soft)', borderColor: 'var(--danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
              <span className="text-danger">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PasskeyButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
    >
      {loading ? (
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
  );
}
