'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Car } from 'lucide-react';
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
      whileTap={isAvailable ? { scale: 0.96 } : {}}
      onClick={() => isAvailable && onSelect(spot)}
      className={`relative w-28 h-44 rounded-2xl p-2 flex flex-col justify-between select-none transition-all duration-200 shrink-0 text-left ${
        isAvailable ? 'cursor-pointer' : 'cursor-default opacity-90'
      } ${
        isSelected
          ? 'bg-slate-900 ring-4 ring-emerald-500 ring-offset-2 ring-offset-white shadow-xl shadow-emerald-600/20'
          : isAvailable
          ? 'bg-slate-900 hover:bg-slate-850 hover:shadow-lg shadow-md border border-slate-700/60'
          : 'bg-slate-950 border border-slate-800 shadow-sm'
      }`}
    >
      {/* Painted White Stall Boundary Lines (Left & Right) */}
      <div className="absolute top-2 bottom-2 left-1.5 w-1 bg-white/70 rounded-full" />
      <div className="absolute top-2 bottom-2 right-1.5 w-1 bg-white/70 rounded-full" />

      {/* Concrete Wheel Stop / Curb at top */}
      <div className="w-full flex justify-center pt-1">
        <div className="h-1.5 w-14 bg-slate-600/90 rounded-full shadow-inner" />
      </div>

      {/* Middle Content Area (Open bay vs Parked Vehicle) */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-1">
        {isOccupied ? (
          /* Realistic Top-Down Car Graphic */
          <div className="relative w-16 h-28 flex flex-col items-center justify-center animate-fade-in">
            {/* Top-Down Minimalist Sedan Silhouette SVG */}
            <svg
              viewBox="0 0 60 110"
              className="w-full h-full drop-shadow-md text-slate-400"
              fill="currentColor"
            >
              {/* Car Body */}
              <rect x="6" y="10" width="48" height="90" rx="14" fill="#334155" />
              {/* Windshield */}
              <path d="M 12 30 L 48 30 L 42 44 L 18 44 Z" fill="#0f172a" opacity="0.8" rx="2" />
              {/* Rear Window */}
              <path d="M 16 78 L 44 78 L 46 88 L 14 88 Z" fill="#0f172a" opacity="0.8" rx="2" />
              {/* Roof */}
              <rect x="15" y="44" width="30" height="34" rx="4" fill="#1e293b" />
              {/* Side Mirrors */}
              <rect x="2" y="32" width="5" height="10" rx="2" fill="#475569" />
              <rect x="53" y="32" width="5" height="10" rx="2" fill="#475569" />
              {/* Headlights */}
              <rect x="10" y="8" width="8" height="4" rx="1.5" fill="#fef08a" opacity="0.9" />
              <rect x="42" y="8" width="8" height="4" rx="1.5" fill="#fef08a" opacity="0.9" />
              {/* Taillights */}
              <rect x="10" y="98" width="8" height="3" rx="1" fill="#ef4444" opacity="0.9" />
              <rect x="42" y="98" width="8" height="3" rx="1" fill="#ef4444" opacity="0.9" />
            </svg>

            {/* License Plate Floating Tag */}
            <div className="absolute top-10 inset-x-0 mx-auto w-max px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[9px] shadow border border-amber-500">
              {session?.vehicle_plate || 'OCCUPIED'}
            </div>
          </div>
        ) : (
          /* Available Open Stall Guide */
          <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isSelected ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                isSelected ? 'text-emerald-300 font-extrabold' : 'text-emerald-400'
              }`}
            >
              {isSelected ? 'Selected' : 'Available'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Stencil Number Painted on Asphalt Floor */}
      <div className="w-full flex items-center justify-between px-1 pt-0.5 border-t border-slate-800">
        <span className="font-mono text-xs font-black tracking-widest text-slate-200">
          {rawNumber}
        </span>

        {isOccupied && timeRemaining ? (
          <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
            <Clock className="w-2.5 h-2.5" />
            {timeRemaining}
          </span>
        ) : (
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            Visitor
          </span>
        )}
      </div>
    </motion.button>
  );
};
