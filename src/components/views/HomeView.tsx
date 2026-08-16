'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Car,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { SectionAisle } from '@/components/parking/SectionAisle';
import { StickyBookingFooter } from '@/components/parking/StickyBookingFooter';
import { RulesModal } from '@/components/modals/RulesModal';
import { BookingTimesModal } from '@/components/modals/BookingTimesModal';
import { InstallPromptCard } from '@/components/pwa/InstallPromptCard';
import { Carpark, Section } from '@/types';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'bookings' | 'status' | 'account') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { site, sections, carparks, sessions, vehicles, bookSpot, releaseSpot, refetch } = useApp();

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
    // If dynamic sections exist in database
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

  const totalVisitorBays = carparks.length || 23;
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
  }) => {
    setIsSubmitting(true);
    try {
      await bookSpot(
        params.spot.id,
        params.spot.spot_number,
        params.plateNumber,
        params.durationHours,
        'visitor',
        params.visitorName
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
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col max-w-lg mx-auto pb-32 animate-fade-in space-y-4">
      {/* PWA Install Alert */}
      <InstallPromptCard />

      {/* Top Location Header (Inspired by Nordic Mobility App) */}
      <div className="card p-4 bg-white border border-slate-200/90 shadow-sm rounded-3xl space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {site?.name || 'Millennium Village'}
                </h2>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {site?.address || '548 Albany Highway, Auckland'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Live Status
            </span>
            <span className="text-sm font-black text-emerald-600">
              {totalAvailableCount} Free
            </span>
          </div>
        </div>

        {/* Quick Rule Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
          <button
            onClick={() => setShowTimesModal(true)}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>24h Max Stay</span>
          </button>
          <span>·</span>
          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Visitor Rules</span>
          </button>
        </div>
      </div>

      {/* Active Session Highlight Card (if any) */}
      {activeSessions.length > 0 && (
        <div className="card p-4 bg-emerald-900 text-white shadow-lg rounded-3xl space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Active Parking Session
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80">
            <div>
              <span className="text-xs font-bold text-emerald-300">Bay</span>
              <div className="text-xl font-black font-mono text-white">
                {activeSessions[0].spot_number.replace('-', '')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-300">Vehicle</span>
              <div className="text-xl font-black font-mono text-amber-300">
                {activeSessions[0].vehicle_plate}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-emerald-200 font-medium">
              Until {new Date(activeSessions[0].expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => releaseSpot(activeSessions[0].id)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Release Early
            </button>
          </div>
        </div>
      )}

      {/* Instruction Sub-Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="section-title text-slate-900">
          Select a Parking Bay
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          Swipe aisle to browse
        </span>
      </div>

      {/* Dynamic Section Aisles */}
      <div className="space-y-4">
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

      {/* Sticky Booking Drawer (Inspired by Reference App) */}
      <StickyBookingFooter
        selectedSpot={selectedSpot}
        vehicles={vehicles}
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
