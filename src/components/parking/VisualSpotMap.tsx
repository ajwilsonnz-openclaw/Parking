'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Carpark, ParkingSession } from '@/types';
import { Layers, Star, CheckCircle, ChevronRight, Car as CarIcon } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

interface VisualSpotMapProps {
  onSelectSpot: (spot: Carpark) => void;
}

export const VisualSpotMap: React.FC<VisualSpotMapProps> = ({ onSelectSpot }) => {
  const { carparks, sessions, favourites, toggleFavourite, config } = useApp();

  const areaList = config.area_divisions.length > 0 ? config.area_divisions : ['Ground Floor', 'Basement Level 1'];
  const [selectedSection, setSelectedSection] = useState<string>(areaList[0]);
  const [activeSelectedSpot, setActiveSelectedSpot] = useState<Carpark | null>(null);

  const filteredSpots = carparks.filter((s) => s.section === selectedSection);

  const getSpotSession = (spotId: string): ParkingSession | undefined => {
    return sessions.find((s) => s.spot_id === spotId && s.is_active);
  };

  return (
    <div className="w-full glass-panel p-4 md:p-6 mb-6">
      {/* Floor / Area Selection Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">Car Park Floor Plan</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {areaList.map((section) => (
            <button
              key={section}
              onClick={() => {
                setSelectedSection(section);
                setActiveSelectedSpot(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSection === section
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Entrance Flow Header */}
      <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider mb-4 px-2">
        <div className="flex items-center gap-1">
          <span>ENTRANCE</span>
          <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-sans normal-case">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied</span>
        </div>
      </div>

      {/* Visual Parking Bay Grid (Matching Image 1 & Image 4 Reference Screenshots) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
        {filteredSpots.map((spot) => {
          const session = getSpotSession(spot.id);
          const isFav = favourites.includes(spot.spot_number);
          const isOccupied = spot.status === 'occupied' || !!session;
          const isResidentExcess = session?.session_type === 'resident_excess';
          const isSelected = activeSelectedSpot?.id === spot.id;

          return (
            <div
              key={spot.id}
              onClick={() => setActiveSelectedSpot(spot)}
              className={`relative rounded-xl p-3 border-2 border-dashed transition-all duration-300 flex flex-col justify-between min-h-[150px] cursor-pointer group ${
                isSelected
                  ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-400 shadow-glow-cyan scale-[1.02]'
                  : isOccupied
                  ? isResidentExcess
                    ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400'
                    : 'border-rose-500/40 bg-rose-950/20 hover:border-rose-400'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-emerald-500/60 hover:bg-slate-900/80'
              }`}
            >
              {/* Parking Bay Header: Spot Badge & Favourite Star */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-900 text-white border border-slate-700 shadow-sm">
                  {spot.spot_number}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(spot.spot_number);
                  }}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Realistic Car Vector Render inside Parking Bay */}
              <div className="my-2 flex flex-col items-center justify-center">
                {isOccupied ? (
                  <div className="flex flex-col items-center">
                    {/* Top-down Realistic Car Vector (Inspired by Image 1 & 4) */}
                    <svg viewBox="0 0 100 50" className="w-16 h-10 drop-shadow-md">
                      {/* Car Body */}
                      <rect
                        x="12"
                        y="8"
                        width="76"
                        height="34"
                        rx="9"
                        fill={isResidentExcess ? '#f59e0b' : '#f43f5e'}
                      />
                      {/* Windshield */}
                      <rect x="28" y="13" width="20" height="24" rx="4" fill="#0f172a" opacity="0.85" />
                      {/* Rear Window */}
                      <rect x="58" y="13" width="18" height="24" rx="4" fill="#0f172a" opacity="0.85" />
                      {/* Headlights */}
                      <circle cx="20" cy="13" r="2.5" fill="#ffffff" opacity="0.9" />
                      {/* Taillights */}
                      <circle cx="20" cy="37" r="2.5" fill="#ffffff" opacity="0.9" />
                    </svg>

                    {session?.vehicle_plate && (
                      <div className="mt-1">
                        <PlateCard plate={session.vehicle_plate} size="sm" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-3 text-emerald-400">
                    <span className="text-xs font-bold tracking-wider uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Bay Status Footer */}
              <div className="text-[10px] text-center text-slate-400 font-medium">
                {isSelected
                  ? 'Selected Spot'
                  : isOccupied
                  ? session?.session_type === 'resident_excess'
                    ? 'Resident Excess'
                    : 'Visitor Parked'
                  : 'Open Bay'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exit Flow Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono uppercase mt-4 px-2">
        <div className="flex items-center gap-1 text-sky-400">
          <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          <span>EXIT FLOW</span>
        </div>

        {/* Selected Spot Action Launcher Button (Matching Image 1 & 4) */}
        {activeSelectedSpot && (
          <button
            onClick={() => onSelectSpot(activeSelectedSpot)}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2"
          >
            <CarIcon className="w-4 h-4" />
            <span>Book Spot {activeSelectedSpot.spot_number}</span>
          </button>
        )}
      </div>
    </div>
  );
};
