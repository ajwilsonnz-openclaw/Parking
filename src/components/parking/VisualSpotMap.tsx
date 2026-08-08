'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Carpark, ParkingSession } from '@/types';
import { Layers, Star, ChevronRight, Car as CarIcon, CheckCircle2 } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

interface VisualSpotMapProps {
  onSelectSpot: (spot: Carpark) => void;
}

export const VisualSpotMap: React.FC<VisualSpotMapProps> = ({ onSelectSpot }) => {
  const { carparks, sessions, favourites, toggleFavourite, config } = useApp();

  const areaList = config.area_divisions.length > 0 ? config.area_divisions : ['Ground Floor', 'Basement Level 1'];
  const [selectedSection, setSelectedSection] = useState<string>(areaList[0]);
  const [selectedSpot, setSelectedSpot] = useState<Carpark | null>(null);

  const filteredSpots = carparks.filter((s) => s.section === selectedSection);

  const getSpotSession = (spotId: string): ParkingSession | undefined => {
    return sessions.find((s) => s.spot_id === spotId && s.is_active);
  };

  return (
    <div className="w-full space-y-3">
      {/* Floor / Area Selection Pills */}
      <div className="glass-panel p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Floor Plan</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {areaList.map((section) => (
            <button
              key={section}
              onClick={() => {
                setSelectedSection(section);
                setSelectedSpot(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
      <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider px-1">
        <div className="flex items-center gap-1">
          <span>ENTRANCE</span>
          <ChevronRight className="w-3 h-3 animate-pulse" />
          <ChevronRight className="w-3 h-3 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-sans normal-case">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-emerald"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose"></span> Occupied</span>
        </div>
      </div>

      {/* Modern High-Precision Car Park Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-950/95 rounded-2xl border border-slate-800 shadow-2xl">
        {filteredSpots.map((spot) => {
          const session = getSpotSession(spot.id);
          const isFav = favourites.includes(spot.spot_number);
          const isOccupied = spot.status === 'occupied' || !!session;
          const isResidentExcess = session?.session_type === 'resident_excess';
          const isSelected = selectedSpot?.id === spot.id;

          return (
            <div
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              className={`relative rounded-2xl p-3 border-2 transition-all duration-300 flex flex-col justify-between min-h-[165px] cursor-pointer group ${
                isSelected
                  ? 'border-sky-400 bg-sky-950/60 ring-4 ring-sky-500/40 shadow-glow-cyan scale-[1.02]'
                  : isOccupied
                  ? isResidentExcess
                    ? 'border-dashed border-amber-500/50 bg-slate-900/90 hover:border-amber-400'
                    : 'border-dashed border-rose-500/50 bg-slate-900/90 hover:border-rose-400'
                  : 'border-dashed border-slate-700/80 bg-slate-900/40 hover:border-emerald-500/60 hover:bg-slate-900/80'
              }`}
            >
              {/* Parking Bay Header: Spot Badge & Favourite Star */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold shadow-sm ${
                    isSelected
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-900 text-slate-200 border border-slate-700'
                  }`}
                >
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

              {/* Parking Bay Center: Unmistakable Top-Down Sedan Vehicle Graphic */}
              <div className="my-2 flex flex-col items-center justify-center relative">
                {isOccupied ? (
                  <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                    {/* Precision Top-Down Car Graphic with Wheels, Hood, Glass & Lights */}
                    <svg viewBox="0 0 120 60" className="w-24 h-12 drop-shadow-xl">
                      {/* Car Body Base */}
                      <rect
                        x="15"
                        y="10"
                        width="90"
                        height="40"
                        rx="12"
                        fill={isResidentExcess ? '#f59e0b' : '#38bdf8'}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      {/* Roof / Cabin */}
                      <rect
                        x="38"
                        y="16"
                        width="44"
                        height="28"
                        rx="6"
                        fill="#0284c7"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      {/* Front Windshield */}
                      <path d="M 38 17 Q 32 30 38 43 Z" fill="#0f172a" opacity="0.9" />
                      {/* Rear Windshield */}
                      <path d="M 82 17 Q 88 30 82 43 Z" fill="#0f172a" opacity="0.9" />
                      {/* Side Mirrors */}
                      <rect x="36" y="5" width="6" height="5" rx="2" fill="#0f172a" />
                      <rect x="36" y="50" width="6" height="5" rx="2" fill="#0f172a" />
                      {/* Wheels (4 Corners) */}
                      <rect x="22" y="6" width="16" height="4" rx="1.5" fill="#090d16" />
                      <rect x="22" y="50" width="16" height="4" rx="1.5" fill="#090d16" />
                      <rect x="82" y="6" width="16" height="4" rx="1.5" fill="#090d16" />
                      <rect x="82" y="50" width="16" height="4" rx="1.5" fill="#090d16" />
                      {/* Bright Headlights */}
                      <ellipse cx="17" cy="16" rx="2" ry="3" fill="#fef08a" />
                      <ellipse cx="17" cy="44" rx="2" ry="3" fill="#fef08a" />
                      {/* Bright Taillights */}
                      <ellipse cx="103" cy="16" rx="2" ry="3" fill="#ef4444" />
                      <ellipse cx="103" cy="44" rx="2" ry="3" fill="#ef4444" />
                    </svg>

                    {session?.vehicle_plate && (
                      <div className="mt-1">
                        <PlateCard plate={session.vehicle_plate} size="sm" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2.5 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-400/90 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-extrabold tracking-wider uppercase bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Bay Status Footer */}
              <div className="text-[10px] text-center font-medium border-t border-slate-800/80 pt-1 text-slate-400">
                {isSelected ? (
                  <span className="text-sky-400 font-bold">Selected Spot</span>
                ) : isOccupied ? (
                  <span>{session?.session_type === 'resident_excess' ? 'Resident Excess' : 'Visitor Parked'}</span>
                ) : (
                  <span className="text-emerald-400/80">Tap to Select</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-20 md:bottom-4 z-30 pt-1">
        <button
          onClick={() => {
            if (selectedSpot) {
              onSelectSpot(selectedSpot);
            } else {
              const firstAvail = filteredSpots.find((s) => s.status === 'available');
              if (firstAvail) onSelectSpot(firstAvail);
            }
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-sm shadow-xl shadow-sky-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
        >
          <CarIcon className="w-5 h-5" />
          <span>
            {selectedSpot
              ? `Pick Parking Spot ${selectedSpot.spot_number}`
              : 'Pick Parking Spot'}
          </span>
        </button>
      </div>
    </div>
  );
};
