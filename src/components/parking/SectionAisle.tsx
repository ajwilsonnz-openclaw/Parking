'use client';

import React from 'react';
import { Carpark, ParkingSession } from '@/types';
import { RealisticCarparkStall } from './RealisticCarparkStall';
import { MapPin } from 'lucide-react';

interface SectionAisleProps {
  title: string;
  spots: Carpark[];
  sessions: ParkingSession[];
  selectedSpotId: string | null;
  onSelectSpot: (spot: Carpark) => void;
}

export const SectionAisle: React.FC<SectionAisleProps> = ({
  title,
  spots,
  sessions,
  selectedSpotId,
  onSelectSpot,
}) => {
  // Count available spots
  const availableCount = React.useMemo(() => {
    return spots.filter((spot) => {
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
  }, [spots, sessions]);

  // Session lookup helper
  const getSessionForSpot = (spot: Carpark) => {
    return (
      sessions.find(
        (s) =>
          s.is_active &&
          (s.spot_number === spot.spot_number ||
            s.spot_number.replace('-', '') === spot.spot_number.replace('-', ''))
      ) || null
    );
  };

  return (
    <div className="card p-3 space-y-2 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
      {/* Section Header (Clean Title Only, No Description) */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black">
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
        </div>

        {/* Live Availability Badge */}
        <div
          className={`chip text-[10px] font-extrabold py-0.5 px-2.5 rounded-full ${
            availableCount > 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {availableCount} of {spots.length} Free
        </div>
      </div>

      {/* Horizontal Swipeable Parking Aisle */}
      <div className="relative pt-0.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth snap-x snap-mandatory">
          {spots.map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            const session = getSessionForSpot(spot);

            return (
              <div key={spot.id} className="snap-start shrink-0">
                <RealisticCarparkStall
                  spot={spot}
                  session={session}
                  isSelected={isSelected}
                  onSelect={onSelectSpot}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
