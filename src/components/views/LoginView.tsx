'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Mail, Loader2 } from 'lucide-react';

type Stage = 'email' | 'code';

export const LoginView: React.FC = () => {
  const { refetch } = useApp();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [stage, setStage] = useState<Stage>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-submit when full 6 digits entered
  useEffect(() => {
    if (code.every((d) => d !== '') && stage === 'code') {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setStage('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true);
    setError(null);
    const fullCode = code.join('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setCode(['', '', '', '', '', '']);
      codeRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(i: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) codeRefs[i + 1].current?.focus();
  }

  function handleCodeKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      codeRefs[i - 1].current?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setCode(text.split(''));
      codeRefs[5].current?.focus();
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
        {/* Branding */}
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
          {stage === 'email' ? (
            <EmailStage
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              onSubmit={handleRequestCode}
            />
          ) : (
            <CodeStage
              email={email}
              code={code}
              codeRefs={codeRefs}
              loading={loading}
              error={error}
              handleCodeChange={handleCodeChange}
              handleCodeKeyDown={handleCodeKeyDown}
              handleCodePaste={handleCodePaste}
              onUseDifferentEmail={() => {
                setStage('email');
                setCode(['', '', '', '', '', '']);
                setError(null);
              }}
            />
          )}
        </div>

        <p className="text-center text-[11px] text-ink-tertiary mt-5">
          Need access? Ask your building management to whitelist your email.
        </p>
      </motion.div>
    </div>
  );
};

function EmailStage({ email, setEmail, loading, error, onSubmit }: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink">Sign in to continue</h2>
        <p className="text-sm text-ink-secondary mt-1">Enter your email to receive a 6-digit login code.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
            <input
              id="email"
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11 py-3 text-base"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {error && (
          <div className="card p-3 bg-danger-soft border-danger/25 text-danger text-xs leading-snug flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading || !email} className="btn-primary w-full disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send code'}
        </button>
      </form>
    </>
  );
}

function CodeStage({ email, code, codeRefs, loading, error, handleCodeChange, handleCodeKeyDown, handleCodePaste, onUseDifferentEmail }: {
  email: string;
  code: string[];
  codeRefs: React.RefObject<HTMLInputElement>[];
  loading: boolean;
  error: string | null;
  handleCodeChange: (i: number, v: string) => void;
  handleCodeKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCodePaste: (e: React.ClipboardEvent) => void;
  onUseDifferentEmail: () => void;
}) {
  return (
    <>
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink">Check your email</h2>
        <p className="text-sm text-ink-secondary mt-1">
          We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
        </p>
      </div>

      <div className="flex justify-center gap-2.5 my-2" onPaste={handleCodePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={codeRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            onKeyDown={(e) => handleCodeKeyDown(i, e)}
            autoFocus={i === 0}
            className="w-12 h-14 rounded-xl border-2 border-border bg-bg-surface text-center text-2xl font-bold text-ink focus:outline-none focus:border-accent transition-colors"
          />
        ))}
      </div>

      {error && (
        <div className="card p-3 bg-danger-soft border-danger/25 text-danger text-xs leading-snug text-center">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      )}

      <button onClick={onUseDifferentEmail} className="btn-ghost w-full text-sm">
        Use a different email
      </button>
    </>
  );
}
