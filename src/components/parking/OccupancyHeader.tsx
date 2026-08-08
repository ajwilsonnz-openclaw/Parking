'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';

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
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {/* 1. Available Visitor Parks */}
      <div className="app-card p-3.5 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Available Visitor Parks
        </span>
        <span className="text-2xl font-black text-emerald-600">
          {availableParksIfResidentStays}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">out of {totalParks}</span>
      </div>

      {/* 2. Visitor Spots Occupied */}
      <div className="app-card p-3.5 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Visitor Spots Occupied
        </span>
        <span className="text-2xl font-black text-slate-800">
          {parksInUse}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">active sessions</span>
      </div>

      {/* 3. Resident Overflow */}
      <div className="app-card p-3.5 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Resident Overflow
        </span>
        <span className="text-2xl font-black text-amber-600">
          {parksInUseByResident}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">excess parked</span>
      </div>

      {/* 4. Potential Max Availability */}
      <div className="app-card p-3.5 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Max Potential Capacity
        </span>
        <span className="text-2xl font-black text-blue-600">
          {availableParksIfResidentMoves}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">if overflow vacates</span>
      </div>
    </div>
  );
};
