'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Carpark, ParkingSession } from '@/types';

interface SleekCarparkLotProps {
  sectionName: string;
  spots: Carpark[];
  sessions: ParkingSession[];
  selectedSpotId: string | null;
  onSelectSpot: (spot: Carpark) => void;
}

export const SleekCarparkLot: React.FC<SleekCarparkLotProps> = ({
  sectionName,
  spots,
  sessions,
  selectedSpotId,
  onSelectSpot,
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

  // Split spots into dual rows if section has 5 or more spots (e.g. Units 1–7, Units 8–13)
  const isDualRow = spots.length >= 5;
  const half = Math.ceil(spots.length / 2);
  const topRow = isDualRow ? spots.slice(0, half) : spots;
  const bottomRow = isDualRow ? spots.slice(half) : [];

  return (
    <div className="w-full bg-[#ECEEF2] border border-slate-300/70 rounded-3xl p-3.5 shadow-sm space-y-2 select-none overflow-hidden relative">
      {/* Top Row Stalls */}
      <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        {topRow.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          const session = getSessionForSpot(spot);
          return (
            <SleekStallItem
              key={spot.id}
              spot={spot}
              session={session}
              isSelected={isSelected}
              onSelect={onSelectSpot}
              facing="down"
            />
          );
        })}
      </div>

      {/* Center Driving Lane Divider (for dual row layouts) */}
      {isDualRow && (
        <div className="relative py-1.5 flex items-center justify-between px-4 border-y border-dashed border-slate-300/80">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Driveway Lane
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-[2px] bg-slate-300/80 rounded-full" />
            <span className="w-6 h-[2px] bg-slate-300/80 rounded-full" />
            <span className="w-6 h-[2px] bg-slate-300/80 rounded-full" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 font-mono">
            5 km/h
          </span>
        </div>
      )}

      {/* Bottom Row Stalls */}
      {isDualRow && (
        <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          {bottomRow.map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            const session = getSessionForSpot(spot);
            return (
              <SleekStallItem
                key={spot.id}
                spot={spot}
                session={session}
                isSelected={isSelected}
                onSelect={onSelectSpot}
                facing="up"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SleekStallItemProps {
  spot: Carpark;
  session?: ParkingSession | null;
  isSelected?: boolean;
  onSelect: (spot: Carpark) => void;
  facing: 'down' | 'up';
}

const SleekStallItem: React.FC<SleekStallItemProps> = ({
  spot,
  session,
  isSelected,
  onSelect,
  facing,
}) => {
  const isOccupied = spot.status === 'occupied' || (session && session.is_active);
  const isAvailable = !isOccupied && spot.status === 'available';
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
      whileTap={isAvailable ? { scale: 0.95 } : {}}
      onClick={() => isAvailable && onSelect(spot)}
      className={`relative w-[58px] h-28 rounded-2xl flex flex-col justify-between p-1.5 transition-all duration-200 shrink-0 text-center ${
        isAvailable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'bg-white shadow-md ring-2 ring-orange-500'
          : isOccupied
          ? 'bg-[#E3E6EC]/80 border border-slate-300/70 shadow-xs'
          : 'bg-[#F7F8FA] hover:bg-white border border-slate-200/90 shadow-xs'
      }`}
    >
      {/* Left and Right Stall Painted Line Indicators */}
      <div className="absolute top-1 bottom-1 left-0 w-[2px] bg-slate-300/80 rounded-full" />
      <div className="absolute top-1 bottom-1 right-0 w-[2px] bg-slate-300/80 rounded-full" />

      {/* Wheel Stop Curb */}
      <div className={`w-full flex justify-center ${facing === 'down' ? 'order-1' : 'order-3'}`}>
        <div className="h-1 w-7 bg-slate-400/70 rounded-full shadow-xs" />
      </div>

      {/* Middle Vehicle Render vs Selected/Empty Capsule */}
      <div className="order-2 flex-1 flex flex-col items-center justify-center relative w-full my-0.5">
        {isOccupied ? (
          /* Parked Top-Down Car with realistic shadow */
          <div className="relative w-full h-16 flex items-center justify-center animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/car_sedan_top.png"
              alt="Parked Vehicle"
              className={`w-11 h-16 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.32)] ${
                facing === 'up' ? 'rotate-180' : ''
              }`}
            />
            {/* License plate overlay */}
            <div className="absolute inset-x-0 bottom-0.5 mx-auto w-max px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[6.5px] shadow-xs border border-amber-500">
              {session?.vehicle_plate || 'PARKED'}
            </div>
          </div>
        ) : isSelected ? (
          /* Selected State: Sleek Capsule with vibrant Orange badge like Image 1 */
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-orange-500/40">
              {rawNumber}
            </div>
            <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-orange-600">
              Selected
            </span>
          </motion.div>
        ) : (
          /* Available State: Clean Number Pill */
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 rounded-full bg-white text-slate-700 font-black text-[11px] flex items-center justify-center border border-slate-200 shadow-2xs">
              {rawNumber}
            </div>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight">
              Free
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sub-info: Spot label and remaining time */}
      <div className={`w-full flex items-center justify-between px-0.5 ${facing === 'down' ? 'order-3' : 'order-1'}`}>
        <span className="text-[8px] font-mono font-extrabold text-slate-500">
          V{rawNumber}
        </span>
        {isOccupied && timeRemaining ? (
          <span className="text-[7.5px] font-bold font-mono text-amber-600 bg-amber-50 px-1 rounded">
            {timeRemaining}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
};
