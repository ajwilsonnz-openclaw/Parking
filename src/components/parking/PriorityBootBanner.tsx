'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { ShieldAlert, Send } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

export const PriorityBootBanner: React.FC = () => {
  const {
    availableParksIfResidentStays,
    longestResidentSessionToBoot,
    sendDirectAlert,
    currentUser,
  } = useApp();

  if (!longestResidentSessionToBoot) return null;

  const isFullCapacity = availableParksIfResidentStays === 0;

  // Only display if visitor parking is full or if management is viewing
  if (!isFullCapacity && currentUser?.role === 'user') return null;

  return (
    <div
      className={`w-full mb-3 px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-3 ${
        isFullCapacity
          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
        <span className="truncate text-[11px]">
          {isFullCapacity ? (
            <>
              <strong>Full Capacity Alert:</strong> Spot <strong className="text-white">{longestResidentSessionToBoot.spot_number}</strong> ({longestResidentSessionToBoot.unit_number}) flagged to vacate.
            </>
          ) : (
            <>
              Resident excess active on <strong className="text-white">{longestResidentSessionToBoot.spot_number}</strong>.
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <PlateCard plate={longestResidentSessionToBoot.vehicle_plate} size="sm" />

        {(currentUser?.role === 'management' || currentUser?.role === 'admin' || currentUser?.unit_number === longestResidentSessionToBoot.unit_number) && (
          <button
            onClick={() => {
              sendDirectAlert(
                longestResidentSessionToBoot.unit_number,
                `URGENT: Please move vehicle (${longestResidentSessionToBoot.vehicle_plate}) from ${longestResidentSessionToBoot.spot_number}. Visitor parking full.`,
                'in_app'
              );
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 shadow"
          >
            <Send className="w-3 h-3" /> Move
          </button>
        )}
      </div>
    </div>
  );
};
