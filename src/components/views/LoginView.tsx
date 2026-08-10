'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, RefreshCw } from 'lucide-react';
import { SignIn, SignUp, useAuth, useUser } from '@clerk/nextjs';
import { useApp } from '@/lib/context/AppContext';

export default function LoginView() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const { currentUser, refetch } = useApp();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refetch();
    }
  }, [isLoaded, isSignedIn, refetch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] flex items-center justify-center shadow-xl shadow-blue-600/30 mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">
            Millennium Village Parking
          </h1>
          <p className="text-sm text-ink-secondary mt-1.5">
            Book visitor &amp; resident carparks in a few taps.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#121824] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Clerk Component */}
        <div className="flex justify-center">
          {mode === 'signin' ? (
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-[#121824] border border-slate-800/80 shadow-2xl rounded-3xl w-full text-white',
                  headerTitle: 'text-white font-bold text-xl',
                  headerSubtitle: 'text-slate-400 text-xs',
                  socialButtonsBlockButton: 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-600/30 transition-all',
                  formFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 py-3',
                  formFieldLabel: 'text-slate-300 font-semibold text-xs uppercase tracking-wider',
                  footerActionLink: 'text-blue-400 hover:text-blue-300 font-bold',
                  identityPreviewText: 'text-white font-semibold',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                  formResendCodeLink: 'text-blue-400 hover:text-blue-300 font-bold',
                  otpCodeFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl font-mono text-xl font-bold',
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-[#121824] border border-slate-800/80 shadow-2xl rounded-3xl w-full text-white',
                  headerTitle: 'text-white font-bold text-xl',
                  headerSubtitle: 'text-slate-400 text-xs',
                  socialButtonsBlockButton: 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-600/30 transition-all',
                  formFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 py-3',
                  formFieldLabel: 'text-slate-300 font-semibold text-xs uppercase tracking-wider',
                  footerActionLink: 'text-blue-400 hover:text-blue-300 font-bold',
                  identityPreviewText: 'text-white font-semibold',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                  formResendCodeLink: 'text-blue-400 hover:text-blue-300 font-bold',
                  otpCodeFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl font-mono text-xl font-bold',
                },
              }}
            />
          )}
        </div>

        {/* Live Diagnostics Panel */}
        {isSignedIn && (
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 text-xs font-mono space-y-2 text-slate-300">
            <div className="flex items-center justify-between text-blue-400 font-bold uppercase tracking-wider text-[10px]">
              <span>Authentication Diagnostics</span>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div>Clerk Status: <span className="text-emerald-400 font-bold">Signed In</span> ({clerkUser?.primaryEmailAddress?.emailAddress || userId})</div>
            <div>D1 User State: {currentUser ? <span className="text-emerald-400 font-bold">{currentUser.name} ({currentUser.role})</span> : <span className="text-amber-400 font-bold">Syncing user state...</span>}</div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export { LoginView };
