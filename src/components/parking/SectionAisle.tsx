'use client';

import React from 'react';
import { Carpark, ParkingSession } from '@/types';
import { RealisticCarparkStall } from './RealisticCarparkStall';
import { MapPin } from 'lucide-react';

interface SectionAisleProps {
  title: string;
  description?: string;
  spots: Carpark[];
  sessions: ParkingSession[];
  selectedSpotId: string | null;
  onSelectSpot: (spot: Carpark) => void;
}

export const SectionAisle: React.FC<SectionAisleProps> = ({
  title,
  description,
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
    <div className="card p-4 space-y-3 bg-white border border-slate-200/90 shadow-sm rounded-3xl">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] font-medium text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Live Availability Badge */}
        <div
          className={`chip text-[11px] font-extrabold py-1 px-3 rounded-full ${
            availableCount > 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {availableCount} of {spots.length} Available
        </div>
      </div>

      {/* Horizontal Swipeable Parking Aisle */}
      <div className="relative pt-1 pb-2">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth snap-x snap-mandatory">
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

        {/* Driving Lane Markings Line Under Stalls */}
        <div className="w-full mt-2 pt-1 border-t-2 border-dashed border-slate-200 flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Driveway Lane</span>
          <span>Swipe for more →</span>
        </div>
      </div>
    </div>
  );
};
