'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Carpark, ParkingSession } from '@/types';

interface SeamlessCarparkGridProps {
  sectionName: string;
  spots: Carpark[];
  sessions: ParkingSession[];
  selectedSpotId: string | null;
  onSelectSpot: (spot: Carpark) => void;
  onOccupiedSpotClick: (spot: Carpark, session: ParkingSession | null) => void;
}

export const SeamlessCarparkGrid: React.FC<SeamlessCarparkGridProps> = ({
  sectionName,
  spots,
  sessions,
  selectedSpotId,
  onSelectSpot,
  onOccupiedSpotClick,
}) => {
  // Session lookup helper
  const getSessionForSpot = (spot: Carpark) => {
    return (
      sessions.find(
        (s) =>
          s.is_active &&
          (s.spot_number === spot.spot_number ||
            s.spot_number.replace('-', '') === spot.spot_number.replace('-', '') ||
            s.spot_id === spot.id ||
            s.carpark_id === spot.id)
      ) || null
    );
  };

  return (
    <div className="w-full">
      {/* 4-Column Responsive Grid wrapping automatically */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full py-1">
        {spots.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          const session = getSessionForSpot(spot);
          const isOccupied = spot.status === 'occupied' || (session && session.is_active);

          return (
            <SeamlessStallItem
              key={spot.id}
              spot={spot}
              session={session}
              isSelected={isSelected}
              isOccupied={!!isOccupied}
              onClick={() => {
                if (isOccupied) {
                  onOccupiedSpotClick(spot, session);
                } else {
                  onSelectSpot(spot);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface SeamlessStallItemProps {
  spot: Carpark;
  session?: ParkingSession | null;
  isSelected?: boolean;
  isOccupied: boolean;
  onClick: () => void;
}

const SeamlessStallItem: React.FC<SeamlessStallItemProps> = ({
  spot,
  session,
  isSelected,
  isOccupied,
  onClick,
}) => {
  const isAvailable = !isOccupied;
  const rawNumber = (spot?.spot_number || '').replace(/^V-?/i, '').padStart(2, '0');

  // Time remaining calculation if occupied
  const timeRemaining = React.useMemo(() => {
    if (!session || !session.expected_end_time) return null;
    const nowMs = Date.now();
    const endMs = new Date(session.expected_end_time).getTime();
    const diffMins = Math.max(0, Math.round((endMs - nowMs) / 60000));
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h`;
    }
    return `${diffMins}m`;
  }, [session]);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-full aspect-[1/1.7] max-h-32 rounded-2xl flex flex-col justify-between p-1.5 transition-all duration-150 text-center select-none ${
        isSelected
          ? 'bg-white shadow-md ring-2 ring-orange-500 scale-[1.02]'
          : isOccupied
          ? 'bg-slate-200/50 hover:bg-slate-200/80 border border-slate-300/80 shadow-2xs cursor-pointer'
          : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs cursor-pointer'
      }`}
    >
      {/* Top Curb Stop */}
      <div className="w-full flex justify-center pt-0.5">
        <div className="h-1 w-8 bg-slate-300/90 rounded-full shadow-2xs" />
      </div>

      {/* Middle Vehicle Render vs Selected / Available State */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full my-0.5">
        {isOccupied ? (
          /* Parked Top-Down Car facing UP */
          <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/car_sedan_top.png"
              alt="Parked Vehicle"
              className="w-10 sm:w-11 h-14 sm:h-16 object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)]"
            />
            {/* Floating License Plate Tag */}
            <div className="absolute inset-x-0 bottom-0 mx-auto w-max px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[6.5px] shadow-xs border border-amber-500">
              {session?.vehicle_plate || 'PARKED'}
            </div>
          </div>
        ) : isSelected ? (
          /* Selected State */
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shadow-sm shadow-orange-500/40">
              {rawNumber}
            </div>
            <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-orange-600">
              Selected
            </span>
          </div>
        ) : (
          /* Available State */
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center border border-slate-200">
              {rawNumber}
            </div>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight">
              Free
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sub-info: Spot label and remaining time */}
      <div className="w-full flex items-center justify-between px-0.5 pt-0.5 border-t border-slate-100">
        <span className="text-[8px] font-mono font-extrabold text-slate-500">
          V{rawNumber}
        </span>
        {isOccupied && timeRemaining ? (
          <span className="text-[7.5px] font-bold font-mono text-amber-700 bg-amber-100/80 px-1 rounded">
            {timeRemaining}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
};
