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
      return `${hours}h ${mins}m`;
    }
    return `${diffMins}m`;
  }, [session]);

  return (
    <motion.button
      type="button"
      whileTap={isAvailable ? { scale: 0.95 } : {}}
      onClick={() => isAvailable && onSelect(spot)}
      className={`relative w-20 h-32 rounded-xl p-1.5 flex flex-col justify-between select-none transition-all duration-150 shrink-0 text-left ${
        isAvailable ? 'cursor-pointer' : 'cursor-default opacity-85'
      } ${
        isSelected
          ? 'bg-slate-900 ring-3 ring-emerald-500 ring-offset-2 ring-offset-white shadow-lg shadow-emerald-600/25'
          : isAvailable
          ? 'bg-slate-900 hover:bg-slate-800 shadow-sm border border-slate-700/60'
          : 'bg-slate-950 border border-slate-800'
      }`}
    >
      {/* Painted White Stall Boundary Lines (Left & Right) */}
      <div className="absolute top-1.5 bottom-1.5 left-1 w-0.5 bg-white/70 rounded-full" />
      <div className="absolute top-1.5 bottom-1.5 right-1 w-0.5 bg-white/70 rounded-full" />

      {/* Concrete Wheel Stop / Curb at top */}
      <div className="w-full flex justify-center pt-0.5">
        <div className="h-1 w-10 bg-slate-600 rounded-full shadow-inner" />
      </div>

      {/* Middle Content Area (Open Stall vs Parked Vehicle) */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-0.5">
        {isOccupied ? (
          /* Realistic Top-Down Car Silhouette */
          <div className="relative w-12 h-18 flex flex-col items-center justify-center animate-fade-in">
            <svg
              viewBox="0 0 60 110"
              className="w-10 h-16 drop-shadow text-slate-400"
              fill="currentColor"
            >
              {/* Car Body */}
              <rect x="8" y="12" width="44" height="86" rx="12" fill="#334155" />
              {/* Windshield */}
              <path d="M 14 32 L 46 32 L 40 46 L 20 46 Z" fill="#0f172a" opacity="0.85" rx="2" />
              {/* Rear Window */}
              <path d="M 18 76 L 42 76 L 44 86 L 16 86 Z" fill="#0f172a" opacity="0.85" rx="2" />
              {/* Roof */}
              <rect x="16" y="46" width="28" height="30" rx="3" fill="#1e293b" />
              {/* Headlights */}
              <rect x="12" y="10" width="7" height="3" rx="1" fill="#fef08a" opacity="0.9" />
              <rect x="41" y="10" width="7" height="3" rx="1" fill="#fef08a" opacity="0.9" />
              {/* Taillights */}
              <rect x="12" y="95" width="7" height="3" rx="1" fill="#ef4444" opacity="0.9" />
              <rect x="41" y="95" width="7" height="3" rx="1" fill="#ef4444" opacity="0.9" />
            </svg>

            {/* License Plate Floating Tag */}
            <div className="absolute top-5 inset-x-0 mx-auto w-max px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[8px] shadow border border-amber-500">
              {session?.vehicle_plate || 'OCCUPIED'}
            </div>
          </div>
        ) : (
          /* Available Open Stall Indicator */
          <div className="flex flex-col items-center justify-center space-y-1">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                  : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isSelected ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stencil Number Painted on Asphalt Floor */}
      <div className="w-full flex items-center justify-between px-0.5 pt-0.5 border-t border-slate-800/80">
        <span className="font-mono text-[11px] font-black tracking-wider text-slate-200">
          {rawNumber}
        </span>

        {isOccupied && timeRemaining && (
          <span className="flex items-center gap-0.5 text-[8px] font-bold text-slate-400">
            <Clock className="w-2 h-2" />
            {timeRemaining}
          </span>
        )}
      </div>
    </motion.button>
  );
};
