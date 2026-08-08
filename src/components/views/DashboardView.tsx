'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Carpark, ParkingSession } from '@/types';
import { OccupancyHeader } from '@/components/parking/OccupancyHeader';
import { PriorityBootBanner } from '@/components/parking/PriorityBootBanner';
import { VisualSpotMap } from '@/components/parking/VisualSpotMap';
import { SpotCard } from '@/components/parking/SpotCard';
import { BookingModal } from '@/components/parking/BookingModal';
import { LayoutGrid, ListFilter, ArrowUpDown, Search, Star, Key } from 'lucide-react';

interface DashboardViewProps {
  onOpenRental: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenRental }) => {
  const { carparks, sessions, favourites, releaseSpot } = useApp();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortMode, setSortMode] = useState<'numerical' | 'closest_available'>('numerical');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'resident_excess'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<Carpark | null>(null);

  const getSpotSession = (spotId: string): ParkingSession | undefined => {
    return sessions.find((s) => s.spot_id === spotId && s.is_active);
  };

  // Filter spots
  const filteredSpots = carparks.filter((spot) => {
    const session = getSpotSession(spot.id);
    const matchesSearch =
      spot.spot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session?.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session?.unit_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'available') return spot.status === 'available' && !session;
    if (filterStatus === 'occupied') return spot.status === 'occupied' && session?.session_type === 'visitor';
    if (filterStatus === 'resident_excess') return session?.session_type === 'resident_excess';

    return true;
  });

  // Sort spots: Favourites at top, then sub-sorted by selected sortMode
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    const aFav = favourites.includes(a.spot_number);
    const bFav = favourites.includes(b.spot_number);

    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;

    if (sortMode === 'closest_available') {
      const aSession = getSpotSession(a.id);
      const bSession = getSpotSession(b.id);

      if (!aSession && bSession) return -1; // Available spot comes first
      if (aSession && !bSession) return 1;
      if (aSession && bSession) {
        return new Date(aSession.expected_end_time).getTime() - new Date(bSession.expected_end_time).getTime();
      }
    }

    // Default Numerical Order
    return a.spot_number.localeCompare(b.spot_number, undefined, { numeric: true });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4-Metric Occupancy Header Bar */}
      <OccupancyHeader />

      {/* Priority Boot Banner (Rule #8) */}
      <PriorityBootBanner />

      {/* View & Filter Controls Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Switcher: Interactive Map vs List Grid */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'map' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Visual Floor Plan Grid
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'list' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" /> Detailed Cards List
          </button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spot or plate..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="numerical">Numerical Order</option>
              <option value="closest_available">Closest Coming Available</option>
            </select>
          </div>

          {/* Status Filter Buttons */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">All Spots</option>
            <option value="available">Available Parks</option>
            <option value="occupied">In Use (Visitor)</option>
            <option value="resident_excess">In Use (Resident Excess)</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <VisualSpotMap onSelectSpot={(spot) => setSelectedSpotForBooking(spot)} />
      ) : (
        <div>
          {/* Favourites Pinned Summary */}
          {favourites.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-3 pl-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Pinned Favourites (Shown at top)</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>
      )}

      {/* Booking Modal */}
      {selectedSpotForBooking && (
        <BookingModal spot={selectedSpotForBooking} onClose={() => setSelectedSpotForBooking(null)} />
      )}
    </div>
  );
};
