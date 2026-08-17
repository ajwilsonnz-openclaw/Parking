'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Carpark, ParkingSession } from '@/types';
import { PlateCard } from '@/components/ui/PlateCard';

interface PaintedLineCarparkGridProps {
  sectionName: string;
  spots: Carpark[];
  sessions: ParkingSession[];
  selectedSpotId: string | null;
  columnsCount?: number;
  onSelectSpot: (spot: Carpark) => void;
  onOccupiedSpotClick: (spot: Carpark, session: ParkingSession | null) => void;
}

export const PaintedLineCarparkGrid: React.FC<PaintedLineCarparkGridProps> = ({
  spots,
  sessions,
  selectedSpotId,
  columnsCount = 6,
  onSelectSpot,
  onOccupiedSpotClick,
}) => {
  // Map spot id/number to active session
  const sessionMap = useMemo(() => {
    const map = new Map<string, ParkingSession>();
    for (const session of sessions) {
      if (session.is_active) {
        if (session.spot_id) map.set(session.spot_id, session);
        if (session.spot_number) {
          map.set(session.spot_number, session);
          map.set(session.spot_number.replace('-', ''), session);
          const norm = 'V' + session.spot_number.replace(/^V-?/i, '').padStart(2, '0');
          map.set(norm, session);
        }
      }
    }
    return map;
  }, [sessions]);

  // Group spots into rows of `columnsCount`
  const rows = useMemo(() => {
    const chunked: Carpark[][] = [];
    for (let i = 0; i < spots.length; i += columnsCount) {
      chunked.push(spots.slice(i, i + columnsCount));
    }
    return chunked;
  }, [spots, columnsCount]);

  return (
    <div className="w-full space-y-4 py-1 select-none">
      {rows.map((rowSpots, rowIndex) => (
        <div key={`row-${rowIndex}`} className="relative w-full">
          {/* Continuous Top Painted Baseline Stripe */}
          <div className="absolute top-1.5 inset-x-0 h-[2px] bg-white/20 z-0 rounded-full" />

          {/* Row of Stalls */}
          <div
            className="grid w-full gap-0 z-10 relative"
            style={{
              gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
            }}
          >
            {rowSpots.map((spot, spotIdx) => {
              const rawSpotNo = spot.spot_number.replace('-', '');
              const normalizedSpot = 'V' + (spot?.spot_number || '').replace(/^V-?/i, '').padStart(2, '0');
              const session =
                sessionMap.get(spot.id) ||
                sessionMap.get(spot.spot_number) ||
                sessionMap.get(rawSpotNo) ||
                sessionMap.get(normalizedSpot) ||
                null;
              const isOccupied = !!session;
              const isSelected = selectedSpotId === spot.id;

              return (
                <PaintedStallItem
                  key={spot.id}
                  spot={spot}
                  session={session}
                  isSelected={isSelected}
                  isOccupied={isOccupied}
                  isFirstInRow={spotIdx === 0}
                  isLastInRow={spotIdx === rowSpots.length - 1}
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
      ))}
    </div>
  );
};

interface PaintedStallItemProps {
  spot: Carpark;
  session: ParkingSession | null;
  isSelected: boolean;
  isOccupied: boolean;
  isFirstInRow: boolean;
  isLastInRow: boolean;
  onClick: () => void;
}

const PaintedStallItem: React.FC<PaintedStallItemProps> = ({
  spot,
  session,
  isSelected,
  isOccupied,
  isLastInRow,
  onClick,
}) => {
  const rawNumber = (spot?.spot_number || '').replace(/^V-?/i, '').padStart(2, '0');

  // Time remaining calculation and urgency flag
  const { timeRemaining, isUrgent } = React.useMemo(() => {
    if (!session || !session.expected_end_time) return { timeRemaining: null, isUrgent: false };
    const nowMs = Date.now();
    const endMs = new Date(session.expected_end_time).getTime();
    const diffMins = Math.max(0, Math.round((endMs - nowMs) / 60000));
    const urgent = diffMins <= 15;
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return { timeRemaining: `${hours}h ${mins}m`, isUrgent: urgent };
    }
    return { timeRemaining: `${diffMins}m`, isUrgent: urgent };
  }, [session]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center justify-between pt-1 pb-1.5 h-[90px] min-h-[90px] max-h-[90px] w-full transition-all outline-none overflow-hidden"
      style={{
        backgroundColor: isSelected ? 'rgba(0,0,0,0.5)' : undefined,
        borderRadius: isSelected ? '0.75rem' : undefined,
        boxShadow: isSelected ? '0 0 14px var(--ambient-glow)' : undefined,
      }}
    >
      {/* Left Painted Vertical Boundary Line (Minimal overhang) */}
      <div className="absolute top-1.5 bottom-0 left-0 w-[2px] bg-white/20 z-10" />

      {/* Right Painted Vertical Boundary Line (for last item in row) */}
      {isLastInRow && (
        <div className="absolute top-1.5 bottom-0 right-0 w-[2px] bg-white/20 z-10" />
      )}

      {/* Stall Stencil Number at Top (Fixed 14px) */}
      <div className="h-[14px] flex items-center justify-center z-10">
        <span
          className="font-mono text-[9.5px] font-black leading-none transition-colors"
          style={{
            color: isSelected
              ? 'var(--accent-secondary)'
              : isOccupied
              ? '#64748b'
              : '#cbd5e1',
          }}
        >
          {rawNumber}
        </span>
      </div>

      {/* Middle Bay Content: Parked Car vs Empty Available Bay (Fixed 52px) */}
      <div className="h-[52px] min-h-[52px] max-h-[52px] w-full flex items-center justify-center relative z-10 px-0.5">
        {isOccupied ? (
          /* Parked Top-Down Car facing UP */
          <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/car_sedan_top.png"
              alt="Parked Vehicle"
              className="w-[82%] max-w-[36px] h-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
            />
            {/* Photorealistic NZ Plate Badge */}
            <div className="absolute -bottom-0.5 mx-auto z-20">
              <PlateCard plate={session?.vehicle_plate || 'PARKED'} size="micro" />
            </div>
          </div>
        ) : isSelected ? (
          /* Selected State */
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full text-slate-950 font-black text-[11px] flex items-center justify-center"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 0 10px var(--ambient-glow)',
            }}
          >
            {rawNumber}
          </motion.div>
        ) : (
          /* Subtle Empty Bay Indicator on Hover/Rest */
          <div className="w-4 h-4 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 transition-colors">
            <span className="w-1 h-1 rounded-full bg-white/20" />
          </div>
        )}
      </div>

      {/* Bottom Sub-info: High-Contrast Remaining Time if occupied (Fixed 14px) */}
      <div className="h-[14px] w-full flex items-center justify-center z-10">
        {isOccupied && timeRemaining ? (
          <span
            className={`text-[7.5px] font-mono font-black px-1.5 py-0.2 rounded-md shadow-xs leading-none ${
              isUrgent
                ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                : 'bg-black/75 border border-slate-700 text-slate-200'
            }`}
          >
            {timeRemaining}
          </span>
        ) : isSelected ? (
          <span
            className="text-[7px] font-extrabold uppercase tracking-wider leading-none"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Selected
          </span>
        ) : null}
      </div>
    </button>
  );
};
