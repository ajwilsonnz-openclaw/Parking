'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, Loader2, X } from 'lucide-react';

const PROMPT_KEY = 'mvp_passkey_prompt_dismissed';

/**
 * After first Clerk login completes, gently offer FaceID / TouchID enrollment.
 * Dismissals are remembered for 7 days, then resurfaced.
 */
export const PasskeyEnrollmentPrompt: React.FC = () => {
  const { currentUser } = useApp();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Only offer if WebAuthn is available in browser
    if (!window.PublicKeyCredential) return;

    // Respect dismissal preference
    try {
      const raw = localStorage.getItem(PROMPT_KEY);
      if (raw) {
        const until = parseInt(raw, 10);
        if (Date.now() < until) return;
      }
    } catch {}

    // Only show once per user
    const shownKey = `mvp_passkey_prompt_${currentUser.id}`;
    if (sessionStorage.getItem(shownKey)) return;
    sessionStorage.setItem(shownKey, '1');

    // Slight delay so it doesn't collide with page mount
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, [currentUser]);

  if (!show) return null;

  const dismiss = (days: number = 7) => {
    try { localStorage.setItem(PROMPT_KEY, String(Date.now() + days * 86400000)); } catch {}
    setShow(false);
  };

  const enable = async () => {
    setLoading(true);
    try {
      const optRes = await fetch('/api/auth/passkeys/register-options', { method: 'POST' });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error);

      const attestation = await startRegistration(optData.options as any);

      const verRes = await fetch('/api/auth/passkeys/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: optData.challengeId, attestation, deviceLabel: null }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error);

      setDone(true);
      setTimeout(() => setShow(false), 1200);
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        // User dismissed — fine
        dismiss(7);
      } else {
        alert(e.message || 'Failed to enable biometric');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-6 relative"
      >
        <button
          onClick={() => dismiss(7)}
          className="absolute top-4 right-4 btn-icon p-1.5"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] flex items-center justify-center shadow-lg shadow-blue-600/25">
            {done ? (
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Fingerprint className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-ink">
              {done ? 'All set!' : 'Sign in faster next time?'}
            </h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-[270px]">
              {done
                ? 'You can now unlock Millennium Village Parking with your fingerprint or face.'
                : 'Enable FaceID / TouchID so you can sign in instantly ' +
                  'with your device\'s biometrics. Skipping email codes entirely.'}
            </p>
          </div>
          {!done && (
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => dismiss(7)}
                className="btn-ghost flex-1 text-xs"
              >
                Not now
              </button>
              <button
                onClick={enable}
                disabled={loading}
                className="btn-primary flex-1 text-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Enable FaceID'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

import { motion } from 'framer-motion';
