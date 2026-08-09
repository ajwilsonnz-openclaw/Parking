'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { startAuthentication } from '@simplewebauthn/browser';
import { motion } from 'framer-motion';
import { Building2, Mail, Loader2, Fingerprint, AlertCircle } from 'lucide-react';

type Stage = 'home' | 'email';

export const LoginView: React.FC = () => {
  const { refetch } = useApp();

  const [stage, setStage] = useState<Stage>('home');
  const [email, setEmail] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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

          {stage === 'home' ? (
            <div className="space-y-4">
              <div className="relative text-center">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <span className="relative bg-bg-surface px-3 text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                  or continue with email
                </span>
              </div>

              <button
                onClick={() => setStage('email')}
                className="btn-ghost w-full text-sm flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email me a code
              </button>
            </div>
          ) : (
            <EmailStage
              email={email}
              setEmail={setEmail}
              onBack={() => setStage('home')}
            />
          )}

          {error && (
            <div className="card p-3 text-xs text-danger flex items-start gap-2" style={{ backgroundColor: 'var(--danger-soft)', borderColor: 'var(--danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

function EmailStage({ email, setEmail, onBack }: { email: string; setEmail: (v: string) => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink">Check your email</h2>
        <p className="text-sm text-ink-secondary mt-1">
          We'll send a 6-digit code to sign you in.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11 py-3 text-base"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="card p-3 text-xs text-ink-secondary" style={{ backgroundColor: 'var(--info-soft)' }}>
          The secure Clerk email sign-in will appear in a modal. After you verify, we'll set up biometric for next time.
        </div>

        <button onClick={onBack} className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
          Go back
        </button>

        {/* The actual Clerk modal opens below via the useEffect inside ClerkEmailView */}
      </form>
    </div>
  );
}
