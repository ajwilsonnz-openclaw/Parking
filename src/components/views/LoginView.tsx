'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';
import { Building2, Loader2 } from 'lucide-react';

// Lazily load Clerk SignIn (it will only render when publishable key is set)
const ClerkSignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false },
);

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [stage, setStage] = useState<'home' | 'email'>('home');

  if (hasClerk) {
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
              Sign in to manage visitors, spots, and rules.
            </p>
          </div>

          <div className="card overflow-hidden">
            <ClerkSignIn />
          </div>
        </motion.div>
      </div>
    );
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    // Fall back to passkey-only behavior (for non-Clerk dev without email)
    setTimeout(() => {
      setEmailLoading(false);
    }, 800);
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
          <p className="text-sm text-ink-secondary mt-1.5">Book visitor & resident carparks in a few taps.</p>
        </div>

        <div className="card p-8 space-y-6">
          <button
            onClick={() => setStage('email')}
            className="btn-ghost w-full text-sm flex items-center justify-center gap-2"
          >
            Email me a code
          </button>

          {stage === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input py-3 text-base"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={emailLoading}>
                {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request sign-in code'}
              </button>
              <button type="button" onClick={() => setStage('home')} className="btn-ghost w-full text-sm">
                Go back
              </button>
            </form>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
