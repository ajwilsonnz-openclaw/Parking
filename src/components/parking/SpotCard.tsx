'use client';

import React from 'react';
import { Carpark, ParkingSession } from '@/types';
import { Star, Clock, User, Phone, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { CountdownTimer } from './CountdownTimer';
import { useApp } from '@/lib/context/AppContext';

interface SpotCardProps {
  spot: Carpark;
  session?: ParkingSession;
  onBook: (spot: Carpark) => void;
  onRelease: (sessionId: string) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, session, onBook, onRelease }) => {
  const { favourites, toggleFavourite, currentUser } = useApp();
  const isFav = favourites.includes(spot.spot_number);
  const isOccupied = spot.status === 'occupied' || !!session;
  const isResidentExcess = session?.session_type === 'resident_excess';
  const isUserOwner = session?.created_by_user_id === currentUser?.id || currentUser?.role !== 'user';

  return (
    <div
      className={`glass-panel p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative group hover:-translate-y-1 ${
        isFav ? 'ring-1 ring-amber-400/40' : ''
      } ${
        isOccupied
          ? isResidentExcess
            ? 'border-amber-500/30 bg-slate-900/80 hover:border-amber-500/60'
            : 'border-rose-500/30 bg-slate-900/80 hover:border-rose-500/60'
          : 'border-emerald-500/30 bg-slate-900/60 hover:border-emerald-500/60 hover:shadow-glow-emerald'
      }`}
    >
      {/* Card Header: Spot Number, Section, Favourite Star */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-extrabold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {spot.spot_number}
          </span>
          <span className="text-xs text-slate-400 font-medium">{spot.section}</span>
        </div>

        <button
          onClick={() => toggleFavourite(spot.spot_number)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          title={isFav ? 'Remove Favourite' : 'Pin to Favourites'}
        >
          <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Card Content: Occupied Session vs Available Status */}
      {isOccupied && session ? (
        <div className="flex flex-col gap-3 my-1">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Vehicle Plate
              </span>
              <div className="mt-1">
                <PlateCard plate={session.vehicle_plate} size="sm" />
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isResidentExcess
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isResidentExcess ? 'Resident Excess' : 'Visitor Parked'}
              </span>
              <span className="text-xs text-slate-400 block mt-1">{session.unit_number}</span>
            </div>
          </div>

          {/* Live Countdown Timer */}
          <CountdownTimer
            startTime={session.start_time}
            expectedEndTime={session.expected_end_time}
            compact
          />
        </div>
      ) : (
        <div className="py-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white">Available Spot</span>
          <span className="text-xs text-slate-400 mt-0.5">Ready for booking (Up to 24h)</span>
        </div>
      )}

      {/* Card Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        {isOccupied && session ? (
          <div className="w-full flex items-center justify-between">
            {isUserOwner ? (
              <button
                onClick={() => onRelease(session.id)}
                className="w-full py-2 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 text-center"
              >
                Release Carpark Now
              </button>
            ) : (
              <div className="w-full text-center text-xs text-slate-400 italic">
                In use by {session.unit_number}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onBook(spot)}
            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            <span>Book Carpark Spot</span>
          </button>
        )}
      </div>
    </div>
  );
};
