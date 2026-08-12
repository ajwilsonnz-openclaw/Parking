'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  User,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { BookingModal } from '@/components/parking/BookingModal';
import { PlateCard } from '@/components/ui/PlateCard';
import { fmtDate, fmtTimeRange, fmtDuration, dateBlockParts } from '@/lib/format';
import { motion } from 'framer-motion';

export const BookingsView: React.FC = () => {
  const { sessions, releaseSpot, carparks, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const nowMs = Date.now();
  const mySessions = sessions.filter((s) => s.unit_number === currentUser?.unit_number);
  const activeSessions = mySessions.filter((s) => s.is_active && new Date(s.expected_end_time).getTime() > nowMs);
  const pastSessions = mySessions.filter((s) => !s.is_active || new Date(s.expected_end_time).getTime() <= nowMs);

  const displayedSessions = activeTab === 'upcoming' ? activeSessions : pastSessions;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-ink tracking-tight font-display">My Bookings</h2>
          <p className="text-xs text-ink-secondary font-medium mt-0.5">
            View and manage your visitor parking bookings.
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="btn-primary px-3 py-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="card p-1.5 grid grid-cols-3 gap-1">
        <FilterTab active={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')} icon={<CalendarIcon className="w-3.5 h-3.5" />} label="Upcoming" />
        <FilterTab active={activeTab === 'past'} onClick={() => setActiveTab('past')} icon={<Clock className="w-3.5 h-3.5" />} label="Past" />
        <FilterTab active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} icon={<XCircle className="w-3.5 h-3.5" />} label="Cancelled" />
      </div>

      {/* Bookings list */}
      <div className="space-y-3">
        {displayedSessions.length === 0 ? (
          <div className="card p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-ink-tertiary mx-auto mb-2 opacity-40" />
            <span className="text-sm font-bold text-ink block">No {activeTab} bookings</span>
            <p className="text-xs text-ink-tertiary mt-0.5">You have no {activeTab} parking sessions.</p>
          </div>
        ) : (
          displayedSessions.map((session) => (
            <BookingCard
              key={session.id}
              session={session}
              isPast={activeTab !== 'upcoming'}
              onEdit={() => setShowBookingModal(true)}
              onCancel={() => releaseSpot(session.id)}
            />
          ))
        )}
      </div>

      {/* Booking ahead banner */}
      {activeTab === 'upcoming' && (
        <div className="card p-4 flex items-center gap-3">
          <div className="icon-tile w-10 h-10 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-ink">Booking ahead?</h4>
            <p className="text-[11px] text-ink-secondary font-medium">
              You can reserve visitor parking up to 24 hours in advance.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-tertiary shrink-0" />
        </div>
      )}

      <BookingModal
        spot={carparks.find((s) => s.status === 'available') || carparks[0]}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
};

function FilterTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        active ? 'text-accent bg-accent-soft shadow-sm' : 'text-ink-tertiary hover:text-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function BookingCard({
  session,
  isPast,
  onEdit,
  onCancel,
}: {
  session: ReturnType<typeof useApp>['sessions'][number];
  isPast: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const now = new Date().getTime();
  const startTime = new Date(session.start_time).getTime();
  const endTime = new Date(session.expected_end_time).getTime();
  const isActiveNow = now >= startTime && now <= endTime;

  const statusChip = isPast ? (
    <span className="chip chip-danger">Expired</span>
  ) : isActiveNow ? (
    <span className="chip chip-success">
      <CheckCircle2 className="w-3 h-3" /> Active Now
    </span>
  ) : (
    <span className="chip chip-accent">
      <Clock className="w-3 h-3" /> Upcoming
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 space-y-3"
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-14 h-16 rounded-2xl bg-accent-soft text-accent flex flex-col items-center justify-center shrink-0 border border-accent-border">
            <span className="text-[9px] font-black uppercase tracking-wider">{dateBlockParts(session.expected_end_time).dow}</span>
            <span className="text-lg font-black leading-none my-0.5">{dateBlockParts(session.expected_end_time).day}</span>
            <span className="text-[9px] font-black uppercase tracking-wider">{dateBlockParts(session.expected_end_time).mon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-ink truncate">Visitor Carpark {session.spot_number}</h4>

            <div className="text-xs text-ink-secondary space-y-1 mt-1.5 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-ink-tertiary shrink-0" />
                <span className="truncate">{session.visitor_name || 'Visitor'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-tertiary shrink-0" />
                <span className="truncate">{fmtTimeRange(session.start_time, session.expected_end_time)} {fmtDuration(session.start_time, session.expected_end_time)}</span>
              </div>
            </div>
          </div>
        </div>

        {statusChip}
      </div>

      {/* Bottom: Plate + actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <PlateCard plate={session.vehicle_plate} size="sm" />
        </div>

        {!isPast && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 rounded-xl text-accent hover:bg-accent-soft transition-colors flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl text-danger hover:bg-danger-soft transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
