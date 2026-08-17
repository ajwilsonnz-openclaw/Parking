'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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
  const rawNumber = (spot?.spot_number || '').replace('-', '').toUpperCase();

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
      style={{
        backgroundImage: "url('/assets/asphalt_texture.png')",
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat',
      }}
      className={`relative w-14 h-24 rounded-xl p-1 flex flex-col justify-between select-none transition-all duration-150 shrink-0 text-left overflow-hidden ${
        isAvailable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white shadow-lg shadow-emerald-600/30'
          : isAvailable
          ? 'hover:brightness-110 shadow-sm border border-slate-700/80'
          : 'opacity-95 border border-slate-800'
      }`}
    >
      {/* Subtle asphalt dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      {/* Painted White Stall Boundary Lines (Left & Right) */}
      <div className="absolute top-1 bottom-1 left-0.5 w-[3px] bg-white/80 rounded-full z-10 shadow-xs" />
      <div className="absolute top-1 bottom-1 right-0.5 w-[3px] bg-white/80 rounded-full z-10 shadow-xs" />

      {/* Concrete Wheel Stop / Curb at top */}
      <div className="w-full flex justify-center pt-0.5 z-10">
        <div className="h-1 w-8 bg-slate-300/90 rounded-sm shadow-xs border-b border-slate-600" />
      </div>

      {/* Middle Content Area: Parked Real Car Asset vs Available Open Bay */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-0.5 z-10 w-full">
        {isOccupied ? (
          /* Realistic Top-Down Parked Car Render Asset */
          <div className="relative w-full h-14 flex items-center justify-center animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/car_sedan_top.png"
              alt="Parked Vehicle"
              className="w-10 h-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
            />

            {/* Floating License Plate Tag */}
            <div className="absolute inset-x-0 bottom-0 mx-auto w-max px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black text-[7px] shadow-sm border border-amber-500">
              {session?.vehicle_plate || 'OCCUPIED'}
            </div>
          </div>
        ) : (
          /* Available Open Stall Indicator */
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50 scale-110'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50'
              }`}
            >
              {isSelected ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stencil Number Painted on Asphalt Floor */}
      <div className="w-full flex items-center justify-between px-0.5 pt-0.5 border-t border-white/20 z-10">
        <span className="font-mono text-[9px] font-black tracking-wider text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          {rawNumber}
        </span>

        {isOccupied && timeRemaining ? (
          <span className="text-[7.5px] font-bold text-amber-300 font-mono drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {timeRemaining}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
};
