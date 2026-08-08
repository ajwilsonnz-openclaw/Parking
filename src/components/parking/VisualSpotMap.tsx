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
    <div className="w-full space-y-4">
      {/* Floor / Area Selector Pills */}
      <div className="glass-panel p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">Car Park Floor Plan</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {areaList.map((section) => (
            <button
              key={section}
              onClick={() => {
                setSelectedSection(section);
                setSelectedSpot(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSection === section
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Entrance Flow Header */}
      <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider px-2">
        <div className="flex items-center gap-1">
          <span>ENTRANCE</span>
          <ChevronRight className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <ChevronRight className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-sans normal-case">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-emerald"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose"></span> Occupied</span>
        </div>
      </div>

      {/* High-End Visual Parking Bay Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 shadow-2xl">
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
                  ? 'border-sky-400 bg-sky-950/50 ring-4 ring-sky-500/40 shadow-glow-cyan scale-[1.03]'
                  : isOccupied
                  ? isResidentExcess
                    ? 'border-dashed border-amber-500/40 bg-slate-900/90 hover:border-amber-400'
                    : 'border-dashed border-rose-500/40 bg-slate-900/90 hover:border-rose-400'
                  : 'border-dashed border-slate-700 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90'
              }`}
            >
              {/* Parking Bay Header: Spot Badge & Favourite Star */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold shadow-sm ${
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
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Parking Bay Center: HD Top-Down Vehicle Asset or Available Tag */}
              <div className="my-1.5 flex flex-col items-center justify-center relative">
                {isOccupied ? (
                  <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                    {/* HD Top-Down Vehicle Image Graphic */}
                    <div className="w-20 h-16 relative flex items-center justify-center overflow-hidden rounded-lg">
                      <img
                        src={isResidentExcess ? '/cars/car_red.jpg' : '/cars/car_white.jpg'}
                        alt="Parked Vehicle"
                        className="w-full h-full object-contain drop-shadow-md rounded-lg"
                      />
                    </div>

                    {session?.vehicle_plate && (
                      <div className="mt-1">
                        <PlateCard plate={session.vehicle_plate} size="sm" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-3 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-400/80 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-extrabold tracking-wider uppercase bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Bay Status Footer */}
              <div className="text-[11px] text-center font-medium border-t border-slate-800/80 pt-1.5 text-slate-400">
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

      {/* Floating Primary Action Bar */}
      <div className="sticky bottom-20 md:bottom-4 z-30 pt-2">
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
