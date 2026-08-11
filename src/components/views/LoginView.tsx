'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { SignIn, SignUp, useAuth, useUser } from '@clerk/nextjs';
import { useApp } from '@/lib/context/AppContext';

export default function LoginView() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { currentUser, refetch, isLoading } = useApp();

  const [stateChecked, setStateChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isLoaded && isSignedIn) {
      Promise.resolve(refetch()).then(() => {
        if (isMounted) setStateChecked(true);
      });
    } else {
      setStateChecked(false);
    }
    return () => { isMounted = false; };
  }, [isLoaded, isSignedIn, refetch]);

  const signedInEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses[0]?.emailAddress || '';
  const isAccessDenied = isLoaded && isSignedIn && stateChecked && !isLoading && !currentUser;
  const isVerifying = isLoaded && isSignedIn && (isLoading || !stateChecked);

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

        {/* Verifying Session Loader */}
        {isVerifying ? (
          <div className="card p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-ink">Verifying resident authorization...</h3>
            <p className="text-xs text-ink-tertiary">Connecting to Millennium Village database</p>
          </div>
        ) : isAccessDenied ? (
          /* Access Denied Banner if signed into Clerk with un-whitelisted email */
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
                Create Account
              </button>
            </div>

            {/* Clerk Form Embed */}
            <div className="clerk-embed-wrapper card p-2 bg-[#121824] border-slate-800 shadow-2xl">
              {mode === 'signin' ? (
                <SignIn
                  routing="hash"
                  signUpUrl="#signup"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none p-4 w-full',
                      headerTitle: 'text-white text-lg font-bold',
                      headerSubtitle: 'text-slate-400 text-xs',
                      socialButtonsBlockButton: 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700',
                      socialButtonsBlockButtonText: 'text-white font-semibold text-xs',
                      dividerLine: 'bg-slate-800',
                      dividerText: 'text-slate-500 text-xs',
                      formFieldLabel: 'text-slate-300 text-xs font-semibold',
                      formFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl focus:border-blue-500 text-sm',
                      formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-2.5 text-sm shadow-lg shadow-blue-600/20',
                      footerActionLink: 'text-blue-400 hover:text-blue-300 text-xs font-bold',
                      identityPreviewText: 'text-white font-medium text-xs',
                      identityPreviewEditButton: 'text-blue-400 text-xs font-bold',
                    },
                  }}
                />
              ) : (
                <SignUp
                  routing="hash"
                  signInUrl="#signin"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none p-4 w-full',
                      headerTitle: 'text-white text-lg font-bold',
                      headerSubtitle: 'text-slate-400 text-xs',
                      socialButtonsBlockButton: 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700',
                      socialButtonsBlockButtonText: 'text-white font-semibold text-xs',
                      dividerLine: 'bg-slate-800',
                      dividerText: 'text-slate-500 text-xs',
                      formFieldLabel: 'text-slate-300 text-xs font-semibold',
                      formFieldInput: 'bg-slate-900 border-slate-700 text-white rounded-xl focus:border-blue-500 text-sm',
                      formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-2.5 text-sm shadow-lg shadow-blue-600/20',
                      footerActionLink: 'text-blue-400 hover:text-blue-300 text-xs font-bold',
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
