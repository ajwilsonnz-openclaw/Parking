'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Carpark, ParkingSession } from '@/types';
import { OccupancyHeader } from '@/components/parking/OccupancyHeader';
import { PriorityBootBanner } from '@/components/parking/PriorityBootBanner';
import { SpotCard } from '@/components/parking/SpotCard';
import { BookingModal } from '@/components/parking/BookingModal';
import { PlusCircle, Search, Star } from 'lucide-react';

interface DashboardViewProps {
  onOpenRental: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenRental }) => {
  const { carparks, sessions, favourites, releaseSpot, availableParksIfResidentStays } = useApp();

  const [sortMode, setSortMode] = useState<'numerical' | 'closest_available'>('numerical');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<Carpark | null>(null);

  const getSpotSession = (spotId: string): ParkingSession | undefined => {
    return sessions.find((s) => s.spot_id === spotId && s.is_active);
  };

  // Requirement: "Only show the Resident Occupied ones if all other spaces are occupied."
  const isAllVisitorParksOccupied = availableParksIfResidentStays === 0;

  // Filter carparks
  const filteredSpots = carparks.filter((spot) => {
    const session = getSpotSession(spot.id);
    const matchesSearch =
      spot.spot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session?.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session?.unit_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Rule: Hide resident excess spots UNLESS visitor availability hits 0
    if (session?.session_type === 'resident_excess' && !isAllVisitorParksOccupied) {
      return false;
    }

    if (filterStatus === 'available') return spot.status === 'available' && !session;
    if (filterStatus === 'occupied') return spot.status === 'occupied';

    return true;
  });

  // Sort spots: Favourites pinned at top, then sub-sorted by sortMode
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    const aFav = favourites.includes(a.spot_number);
    const bFav = favourites.includes(b.spot_number);

    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;

    if (sortMode === 'closest_available') {
      const aSession = getSpotSession(a.id);
      const bSession = getSpotSession(b.id);

      if (!aSession && bSession) return -1;
      if (aSession && !bSession) return 1;
      if (aSession && bSession) {
        return new Date(aSession.expected_end_time).getTime() - new Date(bSession.expected_end_time).getTime();
      }
    }

    return a.spot_number.localeCompare(b.spot_number, undefined, { numeric: true });
  });

  return (
    <div className="space-y-4 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* 4-Metric Occupancy Summary */}
      <OccupancyHeader />

      {/* Priority Vacate Alert (Rule #8) */}
      <PriorityBootBanner />

      {/* Prominent Primary Booking Action Button Card */}
      <div className="app-card p-5 text-center bg-[#0052b4] text-white border-0 shadow-lg">
        <h2 className="text-base font-extrabold tracking-wider uppercase mb-1">
          RESERVE A PARKING SPOT
        </h2>
        <p className="text-xs text-blue-100 font-medium mb-4">
          Instantly register visitor parking or resident overflow space
        </p>

        <button
          onClick={() => {
            const firstAvail = carparks.find((s) => s.status === 'available');
            setSelectedSpotForBooking(firstAvail || carparks[0]);
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 text-[#0052b4] font-black text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <PlusCircle className="w-5 h-5 text-[#0052b4]" />
          <span>BOOK A PARKING SPOT</span>
        </button>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="app-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spot or plate..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="numerical">Numerical Order</option>
            <option value="closest_available">Closest Available</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">All Parks</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
          </select>
        </div>
      </div>

      {/* Favourites Section Header */}
      {favourites.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 uppercase tracking-wider pl-1 pt-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Pinned Favourites</span>
        </div>
      )}

      {/* Spot Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSpots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            session={getSpotSession(spot.id)}
            onBook={(s) => setSelectedSpotForBooking(s)}
            onRelease={(sessionId) => releaseSpot(sessionId)}
          />
        ))}
      </div>

      {/* Booking Modal */}
      {selectedSpotForBooking && (
        <BookingModal spot={selectedSpotForBooking} onClose={() => setSelectedSpotForBooking(null)} />
      )}
    </div>
  );
};
