'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Smartphone,
  BellRing,
  Car,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';
import { useApp } from '@/lib/context/AppContext';

const ONBOARDING_STORAGE_KEY = 'mvp_onboarded_v2';

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const { currentUser, addVehicle, updateConfig } = useApp();
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  // Push notification state
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSubscribingPush, setIsSubscribingPush] = useState<boolean>(false);

  // Vehicle / Unit profile setup state
  const [unitNumber, setUnitNumber] = useState<string>(currentUser?.unit_number?.replace(/^Unit\s+/i, '') || '5');
  const [plateNumber, setPlateNumber] = useState<string>('HZZ303');
  const [makeModel, setMakeModel] = useState<string>('Grey Sedan');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    try {
      const hasOnboarded = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasOnboarded) {
        setIsOpen(true);
      }
    } catch {}
  }, [forceOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleRequestPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Push notifications are not supported by your current browser.');
      return;
    }

    setIsSubscribingPush(true);
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        // Mock / live subscription setup
        try {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BEl62vpGW14yzPln98VU5U26-IsI8mv6Qu12WnVb55urJExEDgsC100223n1234567890abcdef',
          });
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub, unitNumber }),
          }).catch(() => {});
        } catch (subErr) {
          console.log('[Onboarding] Push registration noted:', subErr);
        }
      }
    } catch (err) {
      console.error('[Onboarding] Error requesting notification permission:', err);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleComplete = async () => {
    setIsSavingProfile(true);
    try {
      if (plateNumber.trim()) {
        await addVehicle(plateNumber.trim().toUpperCase(), makeModel.trim()).catch(() => {});
      }
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}

    setIsSavingProfile(false);
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Wizard Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] border z-10 text-slate-100 flex flex-col justify-between overflow-hidden min-h-[480px]"
          style={{
            backgroundColor: 'var(--card-bg, #182028)',
            borderColor: 'var(--card-border, rgba(109,129,150,0.32))',
          }}
        >
          {/* Top Progress Bar & Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: step === i ? '24px' : '8px',
                      background:
                        step >= i
                          ? 'var(--accent-gradient, #6D8196)'
                          : 'rgba(255, 255, 255, 0.15)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: 'var(--text-muted, #CBCBCB)' }}
              >
                Step {step} of 4
              </span>
            </div>

            {/* Step 1: Welcome & Community Rules */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg"
                    style={{
                      background: 'var(--accent-gradient, #6D8196)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Millennium Village
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Smart Visitor Parking System
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border space-y-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                    Community Parking Guidelines
                  </h4>
                  <ul className="text-xs space-y-2.5" style={{ color: 'var(--text-muted)' }}>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-white shrink-0">1.</span>
                      <span><strong>24-Hour Max Stay</strong>: Visitor carparks (V01–V23) are for short-term guests and active sessions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-white shrink-0">2.</span>
                      <span><strong>Live Check-in Only</strong>: No reserving ahead. Check in when your vehicle arrives in the spot.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-white shrink-0">3.</span>
                      <span><strong>Resident Priority</strong>: Excess resident parking is managed automatically to maintain guest availability.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Step 2: Add to Home Screen (PWA Installation) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <Smartphone className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Install for Easy Access
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Add to your home screen
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border space-y-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Installing the app lets you check in visitors in seconds, view spot availability, and receive lock-screen alerts.
                  </p>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>App is already installed on your device!</span>
                    </div>
                  ) : isIos ? (
                    <div className="space-y-2 text-xs p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>How to install on iPhone / iPad:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> in Safari</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">2</span>
                        <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-blue-400" /></span>
                      </div>
                    </div>
                  ) : canInstall ? (
                    <button
                      type="button"
                      onClick={install}
                      className="w-full py-2.5 px-4 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Install App Now</span>
                    </button>
                  ) : (
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                      You can also bookmark this webpage in your browser for fast access.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Free Web Push Notifications */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <BellRing className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Lock-Screen Expiry Alerts
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      100% Free Push Notifications
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border space-y-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Get an instant notification on your lock screen <strong>15 minutes</strong> and <strong>5 minutes</strong> before your visitor parking session expires.
                  </p>

                  {pushStatus === 'granted' ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Notifications enabled! You will receive lock-screen alerts.</span>
                    </div>
                  ) : pushStatus === 'denied' ? (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                      Notifications are currently blocked in your browser settings. You can re-enable them in site permissions.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestPush}
                      disabled={isSubscribingPush}
                      className="w-full py-3 px-4 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <BellRing className="w-4 h-4" />
                      <span>{isSubscribingPush ? 'Enabling...' : 'Enable Free Expiry Alerts'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Resident Unit & Primary Vehicle */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3.5 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <Car className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Your Vehicle Profile
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Register your car for fast 1-tap bookings
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border space-y-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold block mb-1 text-slate-300">
                        Unit Number
                      </label>
                      <input
                        type="text"
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full py-1.5 px-3 text-xs text-white rounded-xl focus:outline-none border bg-black/40 font-bold"
                        style={{ borderColor: 'var(--card-border)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block mb-1 text-slate-300">
                        License Plate
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. HZZ303"
                        className="w-full py-1.5 px-3 text-xs font-mono font-bold uppercase text-white rounded-xl focus:outline-none border bg-black/40"
                        style={{ borderColor: 'var(--card-border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold block mb-1 text-slate-300">
                      Vehicle Description
                    </label>
                    <input
                      type="text"
                      value={makeModel}
                      onChange={(e) => setMakeModel(e.target.value)}
                      placeholder="e.g. Grey Sedan"
                      className="w-full py-1.5 px-3 text-xs text-white rounded-xl focus:outline-none border bg-black/40"
                      style={{ borderColor: 'var(--card-border)' }}
                    />
                  </div>

                  {/* Live NZ Plate Preview */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      Plate Preview:
                    </span>
                    <PlateCard plate={plateNumber || 'HZZ303'} size="sm" showScrews={true} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2 px-3.5 rounded-xl border text-xs font-bold hover:text-white transition-colors flex items-center gap-1 text-slate-300"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSavingProfile}
              className="py-2.5 px-5 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-lg flex items-center gap-1.5"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 0 15px var(--ambient-glow)',
              }}
            >
              <span>{step === 4 ? (isSavingProfile ? 'Saving...' : 'Finish Setup') : 'Continue'}</span>
              {step < 4 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
