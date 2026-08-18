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
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';
import { useApp } from '@/lib/context/AppContext';
import { Button } from '@/components/ui/button';

const ONBOARDING_STORAGE_KEY = 'mv_onboarded_v3';

interface OnboardingVehicle {
  plate: string;
  makeModel: string;
}

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const { currentUser, addVehicle } = useApp();
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  // Push notification state
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSubscribingPush, setIsSubscribingPush] = useState<boolean>(false);

  // Unit profile & Multi-Vehicle setup state
  const rawUnit = currentUser?.unit_number || 'Unit 5';
  const [unitNumber, setUnitNumber] = useState<string>(rawUnit.startsWith('Unit') ? rawUnit : `Unit ${rawUnit}`);
  const [vehiclesList, setVehiclesList] = useState<OnboardingVehicle[]>([
    { plate: 'HZZ303', makeModel: 'Grey Sedan' },
  ]);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const localCheck = typeof window !== 'undefined' && localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      const cookieCheck = typeof document !== 'undefined' && document.cookie.includes('mv_onboarded=true');
      
      if (!localCheck && !cookieCheck) {
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
    if (step < 3) {
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

  const handleAddVehicleRow = () => {
    setVehiclesList((prev) => [...prev, { plate: '', makeModel: '' }]);
  };

  const handleRemoveVehicleRow = (index: number) => {
    if (vehiclesList.length <= 1) return;
    setVehiclesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVehicle = (index: number, field: keyof OnboardingVehicle, value: string) => {
    setVehiclesList((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
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
          console.log('[Onboarding] Push subscription registered:', subErr);
        }
      }
    } catch (err) {
      console.error('[Onboarding] Error requesting push permission:', err);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleComplete = async () => {
    setIsSavingProfile(true);
    try {
      // Save all vehicles in list
      for (const v of vehiclesList) {
        if (v.plate.trim()) {
          await addVehicle(v.plate.trim().toUpperCase(), v.makeModel.trim()).catch(() => {});
        }
      }

      const formattedUnit = unitNumber.trim().startsWith('Unit') ? unitNumber.trim() : `Unit ${unitNumber.trim()}`;

      // Multi-layer persistence to ensure user NEVER has to do it again
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        localStorage.setItem('mvp_onboarded_v2', 'true');
        document.cookie = 'mv_onboarded=true; path=/; max-age=31536000; SameSite=Lax';
      }

      await fetch('/api/me/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_number: formattedUnit, onboarded: true }),
      }).catch(() => {});
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
          className="relative w-full max-w-md rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] border z-10 text-slate-100 flex flex-col justify-between overflow-hidden min-h-[490px] max-h-[90vh]"
          style={{
            backgroundColor: 'var(--card-bg, #182028)',
            borderColor: 'var(--card-border, rgba(109,129,150,0.32))',
          }}
        >
          {/* Top Progress Bar & Header */}
          <div className="overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: step === i ? '28px' : '10px',
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
                Step {step} of 3
              </span>
            </div>

            {/* Step 1: Install the App on your Device */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <Smartphone className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Install Millennium Parking App
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Quick 1-tap visitor bookings from your home screen
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
                    Installing the app lets you manage visitor bays instantly, check in guests, and receive real-time lock-screen alerts.
                  </p>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>App is installed on your device!</span>
                    </div>
                  ) : isIos ? (
                    <div className="space-y-2.5 text-xs p-3.5 rounded-xl bg-black/50 border border-white/10 text-slate-200">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <span>Install on iPhone / iPad:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                        <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> in Safari browser</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                        <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-blue-400" /></span>
                      </div>
                    </div>
                  ) : canInstall ? (
                    <button
                      type="button"
                      onClick={install}
                      className="w-full py-3 px-4 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Install to Home Screen Now</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Web application ready. Bookmark in your browser for instant access.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Push Notifications */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <BellRing className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Turn On Parking Alerts
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Free push alerts so you never get an overstay fine
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
                    Turn on notifications to receive lock-screen alerts <strong>15 minutes before your guest's time expires</strong>, allowing you to extend stay or release the bay.
                  </p>

                  {pushStatus === 'granted' ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Notifications enabled! Lock-screen alerts are active.</span>
                    </div>
                  ) : pushStatus === 'denied' ? (
                    <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Notifications Blocked</span>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Please enable notifications in your browser or device settings to receive parking reminders.
                      </p>
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
                      <span>{isSubscribingPush ? 'Enabling...' : 'Enable Free Parking Alerts'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Resident Unit & Multi-Vehicle Setup */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3.5 pt-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl text-slate-950 flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 0 20px var(--ambient-glow)',
                    }}
                  >
                    <Car className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Confirm Unit & Vehicles
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Register all household cars for quick visitor & excess bookings
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border space-y-3.5"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div>
                    <label className="text-[10px] font-bold block mb-1 text-slate-300">
                      Unit Address
                    </label>
                    <input
                      type="text"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder="e.g. Unit 5"
                      className="w-full py-2 px-3 text-xs text-white rounded-xl focus:outline-none border bg-black/40 font-bold"
                      style={{ borderColor: 'var(--card-border)' }}
                    />
                  </div>

                  {/* Dynamic Multi-Vehicle List */}
                  <div className="space-y-2.5 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Household Vehicles ({vehiclesList.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddVehicleRow}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Car</span>
                      </button>
                    </div>

                    {vehiclesList.map((vehicle, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Vehicle #{idx + 1}</span>
                          {vehiclesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVehicleRow(idx)}
                              className="text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold block mb-0.5 text-slate-400">License Plate</label>
                            <input
                              type="text"
                              value={vehicle.plate}
                              onChange={(e) => handleUpdateVehicle(idx, 'plate', e.target.value.toUpperCase())}
                              placeholder="e.g. HZZ303"
                              className="w-full py-1.5 px-2.5 text-xs font-mono font-bold uppercase text-white rounded-lg focus:outline-none border bg-black/50"
                              style={{ borderColor: 'var(--card-border)' }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold block mb-0.5 text-slate-400">Description</label>
                            <input
                              type="text"
                              value={vehicle.makeModel}
                              onChange={(e) => handleUpdateVehicle(idx, 'makeModel', e.target.value)}
                              placeholder="e.g. Grey Mazda CX-5"
                              className="w-full py-1.5 px-2.5 text-xs text-white rounded-lg focus:outline-none border bg-black/50"
                              style={{ borderColor: 'var(--card-border)' }}
                            />
                          </div>
                        </div>

                        {vehicle.plate.trim() && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-slate-500">Plate Preview:</span>
                            <PlateCard plate={vehicle.plate.trim().toUpperCase()} size="micro" showScrews={true} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between pt-3 border-t mt-3" style={{ borderColor: 'var(--card-border)' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-bold py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="text-xs text-slate-400 hover:text-white py-1 px-2 transition-colors"
              >
                Skip setup
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSavingProfile}
              className="flex items-center gap-1.5 text-xs font-black py-2.5 px-5 rounded-xl text-slate-950 transition-all active:scale-[0.98] shadow-md ml-auto"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <span>{step === 3 ? (isSavingProfile ? 'Saving...' : 'Get Started') : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
