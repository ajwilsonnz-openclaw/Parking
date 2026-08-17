'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { PaintedLineCarparkGrid } from '@/components/parking/PaintedLineCarparkGrid';
import { StickyBookingFooter } from '@/components/parking/StickyBookingFooter';
import { OccupiedSpotModal } from '@/components/modals/OccupiedSpotModal';
import { Carpark, ParkingSession } from '@/types';

interface BookingViewProps {
  initialSectionId?: string;
  onNavigateTab?: (tab: 'home' | 'booking' | 'status' | 'account') => void;
}

export const BookingView: React.FC<BookingViewProps> = () => {
  const { carparks, sessions, vehicles, savedGuests, bookSpot, refetch } = useApp();

  const [selectedSpot, setSelectedSpot] = useState<Carpark | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Occupied spot inspection state
  const [inspectingSpot, setInspectingSpot] = useState<Carpark | null>(null);
  const [inspectingSession, setInspectingSession] = useState<ParkingSession | null>(null);

  // Define and group all carparks into the 4 sections
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
    <div className="flex flex-col max-w-lg mx-auto pb-32 pt-2 animate-fade-in space-y-6 px-1 select-none text-slate-100">
      {/* All Carpark Sections Displayed with Headings */}
      {sectionGroups.map((group) => (
        <div key={group.id} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <span>{group.name}</span>
            </h2>
            <span
              className="text-[11px] font-bold font-mono"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {group.freeCount} of {group.spots.length} Free
            </span>
          </div>

          <PaintedLineCarparkGrid
            sectionName={group.name}
            spots={group.spots}
            sessions={sessions}
            selectedSpotId={selectedSpot?.id || null}
            columnsCount={6}
            onSelectSpot={handleSpotSelect}
            onOccupiedSpotClick={handleOccupiedSpotClick}
          />
        </div>
      ))}

      {/* Sticky Booking Drawer with Linksy dark styling */}
      <StickyBookingFooter
        selectedSpot={selectedSpot}
        vehicles={vehicles}
        savedGuests={savedGuests}
        onClearSelection={() => setSelectedSpot(null)}
        onConfirmBooking={handleConfirmBooking}
        isSubmitting={isSubmitting}
      />

      {/* Occupied Spot Modal */}
      <OccupiedSpotModal
        isOpen={!!inspectingSpot}
        spot={inspectingSpot}
        session={inspectingSession}
        onClose={() => {
          setInspectingSpot(null);
          setInspectingSession(null);
        }}
      />
    </div>
  );
};
