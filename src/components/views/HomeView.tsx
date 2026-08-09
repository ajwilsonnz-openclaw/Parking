'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Building2,
  Settings,
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Car,
  Users,
  AlertCircle,
} from 'lucide-react';
import { BookingModal } from '@/components/parking/BookingModal';
import { BookRegularVisitorModal } from '@/components/parking/BookRegularVisitorModal';
import { RulesModal } from '@/components/modals/RulesModal';
import { BookingTimesModal } from '@/components/modals/BookingTimesModal';
import { InstallPromptCard } from '@/components/pwa/InstallPromptCard';
import { motion } from 'framer-motion';
import { fmtDate, fmtTimeRange, dateBlockParts } from '@/lib/format';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'bookings' | 'status' | 'account') => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.35 } }),
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { config, sessions, carparks } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRegularVisitorModal, setShowRegularVisitorModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTimesModal, setShowTimesModal] = useState(false);

  const activeSessions = sessions.filter((s) => s.is_active);
  const nextBooking = activeSessions[0]; // For now, first active booking
  const availableVisitorCount = carparks.filter((c) => c.status === 'available' && c.spot_number.startsWith(config.spot_prefix || 'V')).length;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-4 animate-fade-in">
      {/* PWA install prompt */}
      <InstallPromptCard />

      {/* Building selector */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
        <div className="card-interactive p-3.5 flex items-center gap-3">
          <div className="icon-tile w-10 h-10">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-ink leading-tight truncate">
              {config.complex_name || 'Millennium Village'}
            </h2>
            <p className="text-[11px] text-ink-tertiary font-medium truncate">
              548 Albany Highway, Albany
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('account')}
            className="btn-icon p-2"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Hero: Book a Visitor Carpark */}
      <motion.button
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        onClick={() => setShowBookingModal(true)}
        className="relative overflow-hidden w-full rounded-3xl p-5 text-left text-white bg-gradient-to-br from-[#0066ff] to-[#0052cc] shadow-glow-accent active:scale-[0.98] transition-transform"
      >
        <div className="absolute right-2 bottom-1 opacity-10 pointer-events-none">
          <Car className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Book a Visitor Carpark
              </h3>
              <p className="text-xs text-blue-100 mt-1 max-w-[210px] leading-snug">
                Reserve a parking space for your visitors in a few taps.
                <span className="block mt-1 font-bold text-white/90">
                  {availableVisitorCount} available now
                </span>
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </motion.button>

      {/* Your upcoming bookings */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">Your upcoming bookings</h3>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-extrabold text-accent hover:underline"
          >
            View all
          </button>
        </div>

        {nextBooking ? (
          <motion.div
            whileHover={{ y: -1 }}
            onClick={() => onNavigateTab('bookings')}
            className="card-interactive p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Date block */}
              <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex flex-col items-center justify-center shrink-0 border border-accent-border">
                <span className="text-[9px] font-black uppercase tracking-wider">{dateBlockParts(nextBooking.expected_end_time).dow}</span>
                <span className="text-lg font-black leading-none my-0.5">{dateBlockParts(nextBooking.expected_end_time).day}</span>
                <span className="text-[9px] font-black uppercase tracking-wider">{dateBlockParts(nextBooking.expected_end_time).mon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-ink truncate">{fmtDate(nextBooking.expected_end_time)}</h4>
                <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">{fmtTimeRange(nextBooking.start_time, nextBooking.expected_end_time)}</p>
                <div className="flex items-center gap-1.5 text-xs text-ink font-bold mt-1">
                  <Car className="w-3.5 h-3.5 text-ink-tertiary" />
                  <span className="truncate">{nextBooking.visitor_name || `Spot ${nextBooking.spot_number}`} ({nextBooking.vehicle_plate})</span>
                </div>
              </div>
            </div>
            <span className="chip chip-success shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Confirmed
            </span>
          </motion.div>
        ) : (
          <div className="card p-6 text-center">
            <Calendar className="w-10 h-10 text-ink-tertiary mx-auto mb-2 opacity-50" />
            <span className="text-sm font-bold text-ink block">No Active Bookings</span>
            <p className="text-xs text-ink-tertiary mt-0.5">Tap above to reserve a visitor park</p>
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="space-y-2">
        <h3 className="section-title px-1">Quick actions</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <QuickAction
            icon={<Clock className="w-5 h-5" />}
            label="My Bookings"
            onClick={() => onNavigateTab('bookings')}
          />
          <QuickAction
            icon={<Users className="w-5 h-5" />}
            label="Book Regular Visitor"
            onClick={() => setShowRegularVisitorModal(true)}
          />
          <QuickAction
            icon={<HelpCircle className="w-5 h-5" />}
            label="How It Works"
            onClick={() => setShowRulesModal(true)}
          />
        </div>
      </motion.div>

      {/* Need to know */}
      <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="space-y-2">
        <h3 className="section-title px-1">Need to know</h3>
        <div className="card overflow-hidden">
          <NeedToKnowRow
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Visitor parking rules"
            description="Please familiarise yourself with the rules."
            onClick={() => setShowRulesModal(true)}
          />
          <div className="h-px" style={{ backgroundColor: 'var(--border-2)' }} />
          <NeedToKnowRow
            icon={<Clock className="w-5 h-5" />}
            title="Booking Times"
            description="How long can I book for?"
            onClick={() => setShowTimesModal(true)}
          />
        </div>
      </motion.div>

      {/* Modals */}
      <BookingModal
        spot={carparks.find((s) => s.status === 'available') || carparks[0]}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
      <BookRegularVisitorModal
        isOpen={showRegularVisitorModal}
        onClose={() => setShowRegularVisitorModal(false)}
      />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <BookingTimesModal isOpen={showTimesModal} onClose={() => setShowTimesModal(false)} />
    </div>
  );
};

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-interactive p-3.5 flex flex-col items-center justify-center text-center gap-1.5"
    >
      <div className="icon-tile w-10 h-10">{icon}</div>
      <span className="text-[10px] font-bold text-ink leading-tight">{label}</span>
    </button>
  );
}

function NeedToKnowRow({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-bg-surface transition-colors group text-left"
    >
      <div className="flex items-center gap-3">
        <div className="icon-tile w-9 h-9">{icon}</div>
        <div>
          <h4 className="text-xs font-bold text-ink">{title}</h4>
          <p className="text-[11px] text-ink-secondary font-medium">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-ink-tertiary group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
    </button>
  );
}
