'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Download, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';

const PERMANENT_DISMISS_KEY = 'mvp_install_dismissed_permanently';
const DISMISS_KEY = 'mvp_install_dismissed_at';
const DISMISS_DAYS = 7;

export const InstallPromptCard: React.FC = () => {
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(PERMANENT_DISMISS_KEY) === 'true') {
        setDismissed(true);
        return;
      }
      const ts = localStorage.getItem(DISMISS_KEY);
      if (!ts) { setDismissed(false); return; }
      const days = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24);
      setDismissed(days < DISMISS_DAYS);
    } catch { setDismissed(false); }
  }, []);

  if (isInstalled || dismissed) return null;

  const dismissTemporary = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setDismissed(true);
  };

  const dismissPermanently = () => {
    try { localStorage.setItem(PERMANENT_DISMISS_KEY, 'true'); } catch {}
    setDismissed(true);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg shadow-blue-600/20">
        <button
          onClick={dismissTemporary}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-blue-100/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold tracking-tight">Install Millennium Village Parking</h3>
            <p className="text-xs text-blue-100 mt-0.5 leading-snug">
              Add to your home screen for faster bookings and instant updates.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => (isIos ? setShowIosHelp(true) : install())}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-extrabold shadow hover:bg-blue-50 active:scale-[0.97] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {isIos ? 'How to install' : 'Install App'}
              </button>
              <button
                onClick={dismissPermanently}
                className="text-[11px] font-bold text-blue-200 hover:text-white hover:underline px-2 py-1"
              >
                Do not remind again
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS instructions bottom sheet */}
      {showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
            <ol className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0">1</span>
                <span className="pt-1">Tap the <Share className="inline w-4 h-4 mx-0.5 -mt-1" /> <strong>Share</strong> button in Safari's bottom bar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0">2</span>
                <span className="pt-1">Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="inline w-4 h-4 mx-0.5 -mt-1" /></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0">3</span>
                <span className="pt-1">Tap <strong>Add</strong> in the top right corner.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
