'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { Carpark, ParkingSession } from '@/types';

interface RealisticCarparkStallProps {
  spot: Carpark;
  session?: ParkingSession | null;
  isSelected?: boolean;
  onSelect: (spot: Carpark) => void;
}

export const RealisticCarparkStall: React.FC<RealisticCarparkStallProps> = ({
  spot,
  session,
  isSelected,
  onSelect,
}) => {
  const isOccupied = spot.status === 'occupied' || (session && session.is_active);
  const isAvailable = !isOccupied && spot.status === 'available';
  const rawNumber = spot.spot_number.replace('-', '').toUpperCase();

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
      whileTap={isAvailable ? { scale: 0.94 } : {}}
      onClick={() => isAvailable && onSelect(spot)}
      className={`relative w-14 h-24 rounded-xl p-1 flex flex-col justify-between select-none transition-all duration-150 shrink-0 text-left ${
        isAvailable ? 'cursor-pointer' : 'cursor-default opacity-90'
      } ${
        isSelected
          ? 'bg-slate-900 ring-2 ring-emerald-500 ring-offset-1 ring-offset-white shadow-md shadow-emerald-600/30'
          : isAvailable
          ? 'bg-slate-900 hover:bg-slate-800 shadow-sm border border-slate-700/60'
          : 'bg-slate-950 border border-slate-800/80'
      }`}
    >
      {/* Painted White Stall Boundary Lines (Left & Right) */}
      <div className="absolute top-1.5 bottom-1.5 left-1 w-0.5 bg-white/65 rounded-full" />
      <div className="absolute top-1.5 bottom-1.5 right-1 w-0.5 bg-white/65 rounded-full" />

      {/* Concrete Wheel Stop / Curb at top */}
      <div className="w-full flex justify-center pt-0.5">
        <div className="h-0.5 w-8 bg-slate-600/90 rounded-full" />
      </div>

      {/* Middle Content Area (Open Stall vs Parked Vehicle) */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-0.5">
        {isOccupied ? (
          /* Realistic Top-Down Car Silhouette */
          <div className="relative w-9 h-12 flex flex-col items-center justify-center animate-fade-in">
            <svg
              viewBox="0 0 60 110"
              className="w-full h-full drop-shadow text-slate-400"
              fill="currentColor"
            >
              {/* Car Body */}
              <rect x="8" y="10" width="44" height="90" rx="12" fill="#334155" />
              {/* Windshield */}
              <path d="M 14 30 L 46 30 L 40 44 L 20 44 Z" fill="#0f172a" opacity="0.9" rx="2" />
              {/* Rear Window */}
              <path d="M 18 76 L 42 76 L 44 86 L 16 86 Z" fill="#0f172a" opacity="0.9" rx="2" />
              {/* Roof */}
              <rect x="16" y="44" width="28" height="32" rx="3" fill="#1e293b" />
              {/* Headlights */}
              <rect x="12" y="8" width="7" height="3" rx="1" fill="#fef08a" opacity="0.9" />
              <rect x="41" y="8" width="7" height="3" rx="1" fill="#fef08a" opacity="0.9" />
              {/* Taillights */}
              <rect x="12" y="97" width="7" height="3" rx="1" fill="#ef4444" opacity="0.9" />
              <rect x="41" y="97" width="7" height="3" rx="1" fill="#ef4444" opacity="0.9" />
            </svg>

            {/* License Plate Floating Tag */}
            <div className="absolute top-3.5 inset-x-0 mx-auto w-max px-0.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[7px] shadow border border-amber-500">
              {session?.vehicle_plate || 'OCC'}
            </div>
          </div>
        ) : (
          /* Available Open Stall Indicator */
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isSelected ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stencil Number Painted on Asphalt Floor */}
      <div className="w-full flex items-center justify-between px-0.5 pt-0.5 border-t border-slate-800/80">
        <span className="font-mono text-[9px] font-black tracking-wider text-slate-200">
          {rawNumber}
        </span>

        {isOccupied && timeRemaining ? (
          <span className="text-[7.5px] font-bold text-slate-400 font-mono">
            {timeRemaining}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
};
