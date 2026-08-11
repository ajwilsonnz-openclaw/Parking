'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { SignIn, SignUp, useAuth, useUser } from '@clerk/nextjs';
import { useApp } from '@/lib/context/AppContext';

export default function LoginView() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { currentUser, refetch, isLoading } = useApp();

  const [hasCheckedState, setHasCheckedState] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refetch();
      const timer = setTimeout(() => setHasCheckedState(true), 600);
      return () => clearTimeout(timer);
    } else {
      setHasCheckedState(false);
    }
  }, [isLoaded, isSignedIn, refetch]);

  const signedInEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses[0]?.emailAddress || '';
  const isAccessDenied = isLoaded && isSignedIn && !isLoading && hasCheckedState && !currentUser;

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

        {/* Access Denied Banner if signed into Clerk with un-whitelisted email */}
        {isAccessDenied ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 space-y-4 border-danger/40 bg-danger-soft/20 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-danger-soft text-danger flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-ink tracking-tight">Access Denied</h2>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Your email <strong className="text-ink font-mono">{signedInEmail}</strong> is not whitelisted for Millennium Village Parking.
              </p>
            </div>

            <div className="card p-3.5 bg-bg text-left text-xs text-ink-secondary space-y-1">
              <span className="font-bold text-ink block">How to get access:</span>
              <p>Contact your building manager and ask them to register <span className="font-mono text-accent font-bold">{signedInEmail}</span> in the Approved Residents whitelist.</p>
            </div>

            <button
              onClick={() => signOut()}
              className="btn-primary w-full py-3 bg-danger hover:bg-danger/90 text-white flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out &amp; Use Whitelisted Account
            </button>
          </motion.div>
        ) : (
          <>
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
          </>
        )}
      </motion.div>
    </div>
  );
}

export { LoginView };
