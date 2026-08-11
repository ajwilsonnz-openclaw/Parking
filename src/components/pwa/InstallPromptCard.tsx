'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Download, Smartphone, MoreVertical } from 'lucide-react';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';

const PERMANENT_DISMISS_KEY = 'mvp_install_dismissed_permanently';
const DISMISS_KEY = 'mvp_install_dismissed_at';
const DISMISS_DAYS = 7;

export const InstallPromptCard: React.FC = () => {
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

  const handleInstallClick = async () => {
    if (canInstall) {
      const res = await install();
      if (res.outcome === 'unavailable') {
        setShowHelpModal(true);
      }
    } else {
      setShowHelpModal(true);
    }
  };

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
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-extrabold shadow hover:bg-blue-50 active:scale-[0.97] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
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

      {/* Instructions Bottom Sheet for iOS & Android / Chrome */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">How to Install App</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIos ? (
              <ol className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">1</span>
                  <span className="pt-0.5">Tap the <Share className="inline w-4 h-4 mx-0.5 text-blue-400 -mt-1" /> <strong>Share</strong> icon in Safari's bottom bar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">2</span>
                  <span className="pt-0.5">Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="inline w-4 h-4 mx-0.5 text-blue-400 -mt-1" /></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">3</span>
                  <span className="pt-0.5">Tap <strong>Add</strong> in the top right corner.</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">1</span>
                  <span className="pt-0.5">Tap the <strong>3 dots menu</strong> <MoreVertical className="inline w-4 h-4 mx-0.5 text-blue-400 -mt-1" /> in your browser's top right corner.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">2</span>
                  <span className="pt-0.5">Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">3</span>
                  <span className="pt-0.5">Follow the on-screen prompt to confirm installation.</span>
                </li>
              </ol>
            )}

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-2 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
