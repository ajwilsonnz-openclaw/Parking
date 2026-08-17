'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, Shield, Clock } from 'lucide-react';
import { Carpark, ParkingSession } from '@/types';

interface OccupiedSpotModalProps {
  isOpen: boolean;
  spot: Carpark | null;
  session: ParkingSession | null;
  onClose: () => void;
}

import { PlateCard } from '@/components/ui/PlateCard';

export const OccupiedSpotModal: React.FC<OccupiedSpotModalProps> = ({
  isOpen,
  spot,
  session,
  onClose,
}) => {
  if (!isOpen || !spot) return null;

  const rawNumber = (spot?.spot_number || '').replace(/^V-?/i, '').padStart(2, '0');
  const rawUnit = session?.unit_number || '12';
  const unitNumber = rawUnit.replace(/^Unit\s+/i, '');
  const phone = session?.visitor_phone || '0211234567';

  // Calculate formatted time remaining and urgency flag
  const formattedEndTime = session?.expected_end_time
    ? new Date(session.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  const { timeRemainingStr, isUrgent } = React.useMemo(() => {
    if (!session || !session.expected_end_time) return { timeRemainingStr: null, isUrgent: false };
    const nowMs = Date.now();
    const endMs = new Date(session.expected_end_time).getTime();
    const diffMins = Math.max(0, Math.round((endMs - nowMs) / 60000));
    const urgent = diffMins <= 15;
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return { timeRemainingStr: `${hours}h ${mins}m`, isUrgent: urgent };
    }
    return { timeRemainingStr: `${diffMins}m`, isUrgent: urgent };
  }, [session]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="relative w-full max-w-sm rounded-3xl p-5 shadow-[0_8px_36px_rgba(0,0,0,0.8)] border z-10 space-y-4 text-slate-100 transition-all backdrop-blur-2xl"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl text-slate-950 flex items-center justify-center font-black font-mono text-sm"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 12px var(--ambient-glow)',
                }}
              >
                V{rawNumber}
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Car Park V{rawNumber}
                </h3>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Currently Occupied
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:text-white transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vehicle & Session Info Card */}
          <div
            className="p-3.5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Vehicle Plate
              </span>
              <PlateCard plate={session?.vehicle_plate || 'PARKED'} size="sm" showScrews={true} />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span
                className="font-bold"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Host
              </span>
              <span
                className="font-bold px-2.5 py-1 rounded-lg border text-white"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderColor: 'var(--card-border)',
                }}
              >
                Guest of Unit {unitNumber}
              </span>
            </div>

            <div
              className="flex items-center justify-between text-xs border-t pt-2.5"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <span
                className="font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>Expires</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-white text-xs">
                  {formattedEndTime}
                </span>
                {timeRemainingStr && (
                  <span
                    className={`font-mono font-black text-[11px] px-2 py-0.5 rounded-lg border ${
                      isUrgent
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                        : 'bg-black/60 border-slate-700 text-slate-200'
                    }`}
                  >
                    {timeRemainingStr} left
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div
            className="flex items-center gap-2 px-1 text-[11px]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Shield className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span>Guest personal name is protected for resident privacy.</span>
          </div>

          {/* Contact Host Actions */}
          <div className="space-y-2 pt-1">
            <span
              className="text-xs font-bold block"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Contact Host (Unit {unitNumber})
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 15px var(--ambient-glow)',
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Host</span>
              </a>

              <a
                href={`sms:${phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all active:scale-[0.98] hover:text-white"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--accent-secondary)',
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Text Host</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
