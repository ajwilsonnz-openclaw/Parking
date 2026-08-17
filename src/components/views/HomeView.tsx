'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Clock,
  Info,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { PaintedLineCarparkGrid } from '@/components/parking/PaintedLineCarparkGrid';
import { StickyBookingFooter } from '@/components/parking/StickyBookingFooter';
import { OccupiedSpotModal } from '@/components/modals/OccupiedSpotModal';
import { RulesModal } from '@/components/modals/RulesModal';
import { BookingTimesModal } from '@/components/modals/BookingTimesModal';
import { Carpark, ParkingSession } from '@/types';

interface HomeViewProps {
  onNavigateTab: (tab: 'home' | 'bookings' | 'status' | 'account') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { site, sections, carparks, sessions, vehicles, savedGuests, bookSpot, releaseSpot, refetch } = useApp();

  const [selectedSpot, setSelectedSpot] = useState<Carpark | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('sec_entrance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTimesModal, setShowTimesModal] = useState(false);

  // Occupied spot inspection state
  const [inspectingSpot, setInspectingSpot] = useState<Carpark | null>(null);
  const [inspectingSession, setInspectingSession] = useState<ParkingSession | null>(null);

  // Active bookings for currently logged-in user / unit
  const activeSessions = useMemo(() => {
    const nowMs = Date.now();
    return sessions.filter(
      (s) => s.is_active && new Date(s.expected_end_time).getTime() > nowMs && !s.end_time
    );
  }, [sessions]);

  // Group carparks dynamically by section
  const sectionGroups = useMemo(() => {
    let allParks = carparks;
    if (!allParks || allParks.length === 0) {
      allParks = Array.from({ length: 23 }, (_, i) => {
        const num = (i + 1).toString().padStart(2, '0');
        return {
          id: `cp_v${num}`,
          site_id: 'site_mv',
          spot_number: `V${num}`,
          section_id: i < 3 ? 'sec_entrance' : i < 14 ? 'sec_units_1_7' : i < 20 ? 'sec_units_8_13' : 'sec_back',
          section: i < 3 ? 'Entrance' : i < 14 ? 'Units 1–7' : i < 20 ? 'Units 8–13' : 'Back of Complex',
          status: 'available',
          is_rentable_private: false,
        };
      });
    }

    const defaultDefs = [
      { id: 'sec_entrance', name: 'Entrance', min: 1, max: 3 },
      { id: 'sec_units_1_7', name: 'Units 1–7', min: 4, max: 14 },
      { id: 'sec_units_8_13', name: 'Units 8–13', min: 15, max: 20 },
      { id: 'sec_back', name: 'Back of Complex', min: 21, max: 99 },
    ];

    return defaultDefs.map((def) => {
      const matchingSpots = allParks.filter((c) => {
        if (c.section_id === def.id || (c.section && c.section.toLowerCase().includes(def.name.toLowerCase()))) {
          return true;
        }
        const num = parseInt((c?.spot_number || '').replace(/^V-?/i, ''), 10);
        return !isNaN(num) && num >= def.min && num <= def.max;
      });

      const freeCount = matchingSpots.filter((spot) => {
        const isOccupied =
          spot.status === 'occupied' ||
          sessions.some(
            (s) =>
              s.is_active &&
              (s.spot_number === spot.spot_number ||
                s.spot_number.replace('-', '') === spot.spot_number.replace('-', '') ||
                s.spot_id === spot.id ||
                s.carpark_id === spot.id)
          );
        return !isOccupied && spot.status === 'available';
      }).length;

      return {
        id: def.id,
        name: def.name,
        spots: matchingSpots,
        freeCount,
      };
    });
  }, [sections, carparks, sessions]);

  // Current active section
  const currentSection = useMemo(() => {
    return sectionGroups.find((s) => s.id === activeSectionId) || sectionGroups[0];
  }, [sectionGroups, activeSectionId]);

  const totalAvailableCount = useMemo(() => {
    return carparks.filter((spot) => {
      const isOccupied =
        spot.status === 'occupied' ||
        sessions.some(
          (s) =>
            s.is_active &&
            (s.spot_number === spot.spot_number ||
              s.spot_number.replace('-', '') === spot.spot_number.replace('-', '') ||
              s.spot_id === spot.id ||
              s.carpark_id === spot.id)
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

  const handleOccupiedSpotClick = (spot: Carpark, session: ParkingSession | null) => {
    setInspectingSpot(spot);
    setInspectingSession(session);
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
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col max-w-lg mx-auto pb-36 animate-fade-in space-y-3 px-1">
      {/* Top Title & Status Bar */}
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

      {/* Refined Active Session Card */}
      {activeSessions.length > 0 && (
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-3.5 space-y-2.5 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Active Session
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Park</span>
              <div className="text-lg font-black font-mono text-slate-900">
                {activeSessions[0].spot_number.replace('-', '')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500">
                {activeSessions[0].visitor_name || 'Vehicle'}
              </span>
              <div className="mt-0.5 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-xs shadow-xs border border-amber-500 inline-block">
                {activeSessions[0].vehicle_plate}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-500 font-medium">
              Until {new Date(activeSessions[0].expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => releaseSpot(activeSessions[0].id)}
              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
            >
              Release Early
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Area Navigation Tabs (Image 2 Style) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {sectionGroups.map((sec) => {
          const isActive = sec.id === activeSectionId;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSectionId(sec.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{sec.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : sec.freeCount > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {sec.freeCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Section Carpark Grid (Seamless on Page Background) */}
      {currentSection && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700">
                {currentSection.name}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {currentSection.freeCount} of {currentSection.spots.length} Available
            </span>
          </div>

          <PaintedLineCarparkGrid
            sectionName={currentSection.name}
            spots={currentSection.spots}
            sessions={sessions}
            selectedSpotId={selectedSpot?.id || null}
            columnsCount={6}
            onSelectSpot={handleSpotSelect}
            onOccupiedSpotClick={handleOccupiedSpotClick}
          />
        </div>
      )}

      {/* Sticky Booking Drawer */}
      <StickyBookingFooter
        selectedSpot={selectedSpot}
        vehicles={vehicles}
        savedGuests={savedGuests}
        onClearSelection={() => setSelectedSpot(null)}
        onConfirmBooking={handleConfirmBooking}
        isSubmitting={isSubmitting}
      />

      {/* Occupied Spot Modal (Shows Host Unit & Call/Text Actions, protects Guest Name) */}
      <OccupiedSpotModal
        isOpen={!!inspectingSpot}
        spot={inspectingSpot}
        session={inspectingSession}
        onClose={() => {
          setInspectingSpot(null);
          setInspectingSession(null);
        }}
      />

      {/* Rules & Info Modals */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <BookingTimesModal isOpen={showTimesModal} onClose={() => setShowTimesModal(false)} />
    </div>
  );
};
