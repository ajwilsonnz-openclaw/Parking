'use client';

import React from 'react';
import { Carpark, ParkingSession } from '@/types';
import { Star, CheckCircle2, Clock } from 'lucide-react';
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
      className={`app-card p-4 flex flex-col justify-between transition-all duration-200 ${
        isFav ? 'ring-2 ring-amber-400' : ''
      } ${
        isOccupied
          ? isResidentExcess
            ? 'border-amber-300 bg-amber-50/30'
            : 'border-rose-200 bg-rose-50/20'
          : 'hover:border-blue-400 hover:shadow-md'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
            {spot.spot_number}
          </span>
          <span className="text-xs text-slate-500 font-medium">{spot.section}</span>
        </div>

        <button
          onClick={() => toggleFavourite(spot.spot_number)}
          className="p-1 rounded-lg text-slate-300 hover:text-amber-500 transition-colors"
          title={isFav ? 'Remove Favourite' : 'Pin Favourite'}
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      {isOccupied && session ? (
        <div className="flex flex-col gap-2.5 my-1">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Vehicle Plate
              </span>
              <div className="mt-1">
                <PlateCard plate={session.vehicle_plate} size="sm" />
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  isResidentExcess
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isResidentExcess ? 'Resident Overflow' : 'Visitor Session'}
              </span>
              <span className="text-xs text-slate-600 block mt-1 font-semibold">{session.unit_number}</span>
            </div>
          </div>

          <CountdownTimer
            startTime={session.start_time}
            expectedEndTime={session.expected_end_time}
            compact
          />
        </div>
      ) : (
        <div className="py-3 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase text-emerald-700 tracking-wide">Available Visitor Park</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Ready for booking</span>
        </div>
      )}

      {/* Card Footer Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        {isOccupied && session ? (
          isUserOwner ? (
            <button
              onClick={() => onRelease(session.id)}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow text-center"
            >
              Release Park Now
            </button>
          ) : (
            <div className="w-full text-center text-xs text-slate-400 italic py-1 font-medium">
              In use by {session.unit_number}
            </div>
          )
        ) : (
          <button
            onClick={() => onBook(spot)}
            className="w-full py-2 px-3 rounded-xl bg-[#0052b4] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow text-center"
          >
            Book This Park
          </button>
        )}
      </div>
    </div>
  );
};
