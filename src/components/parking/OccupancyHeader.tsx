'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Car, UserCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const OccupancyHeader: React.FC = () => {
  const {
    parksInUse,
    parksInUseByResident,
    availableParksIfResidentStays,
    availableParksIfResidentMoves,
    config,
  } = useApp();

  const totalParks = config.total_visitor_parks;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 md:p-2.5 mb-3 shadow-md">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-3 text-center">
        {/* 1. Parks in Use */}
        <div className="bg-slate-950/70 rounded-lg px-2.5 py-1.5 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
            <Car className="w-3 h-3 text-rose-400" /> In Use
          </span>
          <div className="font-mono text-xs font-extrabold text-white">
            <span className="text-rose-400">{parksInUse}</span>
            <span className="text-[10px] text-slate-500 font-normal">/{totalParks}</span>
          </div>
        </div>

        {/* 2. Resident Excess */}
        <div className="bg-slate-950/70 rounded-lg px-2.5 py-1.5 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-amber-400" /> Res Excess
          </span>
          <span className="font-mono text-xs font-extrabold text-amber-400">{parksInUseByResident}</span>
        </div>

        {/* 3. Avail (Resident Stays) */}
        <div className="bg-slate-950/70 rounded-lg px-2.5 py-1.5 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Avail (Stays)
          </span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">{availableParksIfResidentStays}</span>
        </div>

        {/* 4. Avail (Resident Moves) */}
        <div className="bg-slate-950/70 rounded-lg px-2.5 py-1.5 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-sky-400" /> Avail (Moves)
          </span>
          <span className="font-mono text-xs font-extrabold text-sky-400">{availableParksIfResidentMoves}</span>
        </div>
      </div>
    </div>
  );
};
