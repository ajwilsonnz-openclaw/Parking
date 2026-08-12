'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Car,
  Users,
  Info,
  Shield,
} from 'lucide-react';
import { BookingModal } from '@/components/parking/BookingModal';
import { BookRegularVisitorModal } from '@/components/parking/BookRegularVisitorModal';
import { RulesModal } from '@/components/modals/RulesModal';
import { BookingTimesModal } from '@/components/modals/BookingTimesModal';
import { InstallPromptCard } from '@/components/pwa/InstallPromptCard';
import { fmtDate, fmtTimeRange, dateBlockParts } from '@/lib/format';
import { SavedGuest } from '@/types';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'bookings' | 'status' | 'account') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { config, sessions, carparks } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRegularVisitorModal, setShowRegularVisitorModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTimesModal, setShowTimesModal] = useState(false);

  // Selected regular visitor prefill
  const [prefillPlate, setPrefillPlate] = useState('');
  const [prefillName, setPrefillName] = useState('');
  const [prefillPhone, setPrefillPhone] = useState('');

  const activeSessions = sessions.filter((s) => s.is_active && new Date(s.expected_end_time).getTime() > Date.now());
  const nextBooking = activeSessions[0];
  const availableVisitorCount = carparks.filter((c) => c.status === 'available' && c.spot_number.startsWith(config.spot_prefix || 'V')).length;

  const handleOpenNormalBooking = () => {
    setPrefillPlate('');
    setPrefillName('');
    setPrefillPhone('');
    setShowBookingModal(true);
  };

  const handleSelectRegularVisitor = (guest: SavedGuest) => {
    setPrefillPlate(guest.plate);
    setPrefillName(guest.name);
    setPrefillPhone(guest.phone || '');
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col justify-between max-w-lg mx-auto pb-20 sm:pb-24 animate-fade-in px-1 space-y-3">
      {/* PWA install prompt */}
      <InstallPromptCard />

      {/* Hero: Book a Visitor Carpark */}
      <div className="w-full">
        <button
          onClick={handleOpenNormalBooking}
          className="relative overflow-hidden w-full rounded-3xl p-5 text-left text-white bg-gradient-to-br from-[#0066ff] via-[#0055e6] to-[#0044cc] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all hover:shadow-2xl hover:shadow-blue-600/30 border border-blue-400/20"
        >
          <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none">
            <Car className="w-40 h-40" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1 pr-3">
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                Book a Visitor Carpark
              </h3>
              <p className="text-xs text-blue-100/90 mt-1.5 max-w-[220px] leading-relaxed font-medium">
                Reserve a parking space for your visitors in a few taps.
              </p>
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-blue-950/40 backdrop-blur-md border border-blue-400/20 text-xs font-bold text-blue-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{availableVisitorCount} available now</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg shrink-0 font-bold">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </button>
      </div>

      {/* Your upcoming booking */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-ink tracking-tight">Your upcoming booking</h3>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-extrabold text-accent hover:underline"
          >
            View all
          </button>
        </div>

        {nextBooking ? (
          <div
            onClick={() => onNavigateTab('bookings')}
            className="card p-3.5 flex items-center justify-between cursor-pointer hover:border-accent/40 transition-all"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Date block */}
              <div className="w-14 h-16 rounded-2xl bg-blue-950/50 dark:bg-slate-900 border border-blue-500/20 text-blue-400 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">{dateBlockParts(nextBooking.expected_end_time).dow}</span>
                <span className="text-xl font-black leading-none my-0.5 text-white">{dateBlockParts(nextBooking.expected_end_time).day}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">{dateBlockParts(nextBooking.expected_end_time).mon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-ink truncate">{fmtDate(nextBooking.expected_end_time)}</h4>
                <p className="text-xs font-medium text-ink-secondary mt-0.5">{fmtTimeRange(nextBooking.start_time, nextBooking.expected_end_time)}</p>
                <div className="flex items-center gap-1.5 text-xs text-ink font-bold mt-1">
                  <Car className="w-3.5 h-3.5 text-ink-tertiary shrink-0" />
                  <span className="truncate">{nextBooking.visitor_name || `Spot ${nextBooking.spot_number}`} ({nextBooking.vehicle_plate})</span>
                </div>
              </div>
            </div>
            <span className="chip bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-xs shrink-0 py-1 px-2.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
            </span>
          </div>
        ) : (
          <div className="card p-5 text-center">
            <Calendar className="w-8 h-8 text-ink-tertiary mx-auto mb-1.5 opacity-50" />
            <span className="text-xs font-bold text-ink block">No Active Bookings</span>
            <p className="text-[11px] text-ink-tertiary mt-0.5">Tap above to reserve a visitor park</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-ink tracking-tight px-1">Quick actions</h3>
        <div className="grid grid-cols-3 gap-2">
          <QuickActionCard
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
            title="My Bookings"
            subtitle="View and manage"
            onClick={() => onNavigateTab('bookings')}
          />
          <QuickActionCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            title="Book Regular Visitor"
            subtitle="Add a regular visitor"
            onClick={() => setShowRegularVisitorModal(true)}
          />
          <QuickActionCard
            icon={<Info className="w-5 h-5 text-blue-400" />}
            title="How It Works"
            subtitle="Learn more"
            onClick={() => setShowRulesModal(true)}
          />
        </div>
      </div>

      {/* Need to know */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-ink tracking-tight px-1">Need to know</h3>
        <div className="card overflow-hidden">
          <NeedToKnowRow
            icon={<Shield className="w-4 h-4 text-blue-400" />}
            title="Visitor parking rules"
            description="Please familiarise yourself with the rules."
            onClick={() => setShowRulesModal(true)}
          />
          <div className="h-px bg-border/50" />
          <NeedToKnowRow
            icon={<Clock className="w-4 h-4 text-blue-400" />}
            title="Booking Times"
            description="How long can I book for?"
            onClick={() => setShowTimesModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        initialPlate={prefillPlate}
        initialVisitorName={prefillName}
        initialVisitorPhone={prefillPhone}
      />
      <BookRegularVisitorModal
        isOpen={showRegularVisitorModal}
        onClose={() => setShowRegularVisitorModal(false)}
        onSelectGuest={handleSelectRegularVisitor}
        onGoToNormalBooking={handleOpenNormalBooking}
      />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <BookingTimesModal isOpen={showTimesModal} onClose={() => setShowTimesModal(false)} />
    </div>
  );
};

function QuickActionCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-3.5 flex flex-col items-center justify-center text-center gap-1.5 hover:border-accent/40 transition-all active:scale-[0.97]"
    >
      <div className="w-10 h-10 rounded-2xl bg-blue-950/40 dark:bg-slate-900 border border-blue-500/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-xs font-bold text-ink block truncate">{title}</span>
        <span className="text-[10px] font-medium text-ink-tertiary block truncate">{subtitle}</span>
      </div>
    </button>
  );
}

function NeedToKnowRow({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 hover:bg-bg-surface transition-colors group text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-950/40 dark:bg-slate-900 border border-blue-500/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-bold text-ink">{title}</h4>
          <p className="text-[11px] text-ink-secondary font-medium">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-ink-tertiary group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
    </button>
  );
}
