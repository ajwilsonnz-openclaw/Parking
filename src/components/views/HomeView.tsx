'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Clock,
  CheckCircle2,
  Car,
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SectionAisle } from '@/components/parking/SectionAisle';
import { StickyBookingFooter } from '@/components/parking/StickyBookingFooter';
import { RulesModal } from '@/components/modals/RulesModal';
import { BookingTimesModal } from '@/components/modals/BookingTimesModal';
import { InstallPromptCard } from '@/components/pwa/InstallPromptCard';
import { Carpark } from '@/types';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'bookings' | 'status' | 'account') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { site, sections, carparks, sessions, vehicles, savedGuests, bookSpot, releaseSpot, refetch } = useApp();

  const [selectedSpot, setSelectedSpot] = useState<Carpark | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTimesModal, setShowTimesModal] = useState(false);

  // Active bookings for currently logged-in user / unit
  const activeSessions = useMemo(() => {
    const nowMs = Date.now();
    return sessions.filter(
      (s) => s.is_active && new Date(s.expected_end_time).getTime() > nowMs && !s.end_time
    );
  }, [sessions]);

  // Group carparks dynamically by section
  const sectionGroups = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.map((sec) => ({
        id: sec.id,
        name: sec.name,
        description: sec.description,
        spots: carparks.filter(
          (c) => c.section_id === sec.id || c.section === sec.name
        ),
      }));
    }

    // Fallback default sections if DB empty
    const entrance = carparks.filter((c) => ['V01', 'V02', 'V03', 'V-01', 'V-02', 'V-03'].includes(c.spot_number));
    const units1_7 = carparks.filter((c) => {
      const num = parseInt(c.spot_number.replace(/^V-?/i, ''), 10);
      return num >= 4 && num <= 14;
    });
    const units8_13 = carparks.filter((c) => {
      const num = parseInt(c.spot_number.replace(/^V-?/i, ''), 10);
      return num >= 15 && num <= 20;
    });
    const back = carparks.filter((c) => {
      const num = parseInt(c.spot_number.replace(/^V-?/i, ''), 10);
      return num >= 21 && num <= 23;
    });

    return [
      { id: 'sec_entrance', name: 'Entrance', description: 'Main entrance area', spots: entrance.length ? entrance : carparks.slice(0, 3) },
      { id: 'sec_units_1_7', name: 'Units 1–7', description: 'Front townhouse wing', spots: units1_7.length ? units1_7 : carparks.slice(3, 14) },
      { id: 'sec_units_8_13', name: 'Units 8–13', description: 'Middle townhouse wing', spots: units8_13.length ? units8_13 : carparks.slice(14, 20) },
      { id: 'sec_back', name: 'Back of Complex', description: 'Rear courtyard area', spots: back.length ? back : carparks.slice(20, 23) },
    ];
  }, [sections, carparks]);

  const totalAvailableCount = useMemo(() => {
    return carparks.filter((spot) => {
      const isOccupied =
        spot.status === 'occupied' ||
        sessions.some(
          (s) =>
            s.is_active &&
            (s.spot_number === spot.spot_number ||
              s.spot_number.replace('-', '') === spot.spot_number.replace('-', ''))
        );
      return !isOccupied && spot.status === 'available';
    }).length;
  }, [carparks, sessions]);

  const handleSpotSelect = (spot: Carpark) => {
    if (selectedSpot?.id === spot.id) {
      setSelectedSpot(null);
    } else {
      setSelectedSpot(spot);
    }
  };

  const handleConfirmBooking = async (params: {
    spot: Carpark;
    plateNumber: string;
    durationHours: number;
    visitorName?: string;
    savedGuestId?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await bookSpot(
        params.spot.id,
        params.spot.spot_number,
        params.plateNumber,
        params.durationHours,
        'visitor',
        params.visitorName,
        undefined,
        params.savedGuestId
      );
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to book parking space');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col max-w-lg mx-auto pb-36 animate-fade-in space-y-3.5 px-1">
      {/* PWA Install Alert */}
      <InstallPromptCard />

      {/* Top Action & Status Bar */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Select a Visitor Car Park
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => setShowTimesModal(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>24h Max</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setShowRulesModal(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Visitor Rules</span>
            </button>
          </div>
        </div>

        {/* Live Free Counter */}
        <div className="chip py-1.5 px-3 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
          {totalAvailableCount} of {carparks.length || 23} Free
        </div>
      </div>

      {/* Active Session Highlight Card (if any) */}
      {activeSessions.length > 0 && (
        <div className="card p-3.5 bg-emerald-900 text-white shadow-md rounded-2xl space-y-2.5 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                Active Parking Session
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/80">
            <div>
              <span className="text-[10px] font-bold text-emerald-300">Park</span>
              <div className="text-lg font-black font-mono text-white">
                {activeSessions[0].spot_number.replace('-', '')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-300">
                {activeSessions[0].visitor_name || 'Vehicle'}
              </span>
              <div className="text-lg font-black font-mono text-amber-300">
                {activeSessions[0].vehicle_plate}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-200 font-medium">
              Until {new Date(activeSessions[0].expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => releaseSpot(activeSessions[0].id)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Release Early
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Section Aisles */}
      <div className="space-y-3.5">
        {sectionGroups.map((sec) => (
          <SectionAisle
            key={sec.id}
            title={sec.name}
            description={sec.description}
            spots={sec.spots}
            sessions={sessions}
            selectedSpotId={selectedSpot?.id || null}
            onSelectSpot={handleSpotSelect}
          />
        ))}
      </div>

      {/* Sticky Booking Drawer */}
      <StickyBookingFooter
        selectedSpot={selectedSpot}
        vehicles={vehicles}
        savedGuests={savedGuests}
        onClearSelection={() => setSelectedSpot(null)}
        onConfirmBooking={handleConfirmBooking}
        isSubmitting={isSubmitting}
      />

      {/* Rules & Info Modals */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <BookingTimesModal isOpen={showTimesModal} onClose={() => setShowTimesModal(false)} />
    </div>
  );
};
