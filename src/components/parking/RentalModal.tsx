'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { X, Key, DollarSign, Calendar } from 'lucide-react';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RentalModal: React.FC<RentalModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, config, rentOutSpot, rentals, bookRentedSpot, vehicles } = useApp();

  const [activeTab, setActiveTab] = useState<'rent_mine' | 'browse_rentals'>('rent_mine');
  const [assignedSpot, setAssignedSpot] = useState<string>('P-102 (Unit 402)');
  const [availableWeeks, setAvailableWeeks] = useState<number>(1);
  const [pricePerWeek, setPricePerWeek] = useState<number>(35);
  const [selectedRenterPlate, setSelectedRenterPlate] = useState<string>(vehicles[0]?.plate_number || 'GHJ125');

  if (!isOpen) return null;

  const handleListSpot = (e: React.FormEvent) => {
    e.preventDefault();
    rentOutSpot(assignedSpot, availableWeeks, pricePerWeek);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Resident Spot Rental</h3>
            <p className="text-xs text-slate-400">Rent out your assigned spot or reserve a neighbor&apos;s spot</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-5 text-xs">
          <button
            onClick={() => setActiveTab('rent_mine')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'rent_mine' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rent My Assigned Spot
          </button>
          <button
            onClick={() => setActiveTab('browse_rentals')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'browse_rentals' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Listings ({rentals.filter(r => r.status === 'listed').length})
          </button>
        </div>

        {activeTab === 'rent_mine' ? (
          <form onSubmit={handleListSpot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Your Assigned Spot Number
              </label>
              <input
                type="text"
                value={assignedSpot}
                onChange={(e) => setAssignedSpot(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Rental Duration (Weeks)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={availableWeeks}
                  onChange={(e) => setAvailableWeeks(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-xs font-mono font-bold text-purple-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
                  {availableWeeks} {availableWeeks === 1 ? 'Week' : 'Weeks'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Weekly Rental Price ($ NZD)
                </label>
                <span className="text-[11px] text-purple-400">
                  Max Limit: ${config.max_weekly_rental_price.toFixed(2)}/wk
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="0"
                    max={config.max_weekly_rental_price}
                    step="5"
                    value={pricePerWeek}
                    onChange={(e) => setPricePerWeek(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPricePerWeek(0)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    pricePerWeek === 0 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  List For FREE
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                List Spot for Rent
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {rentals.filter((r) => r.status === 'listed').length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No resident spots currently listed for rent.
              </div>
            ) : (
              rentals
                .filter((r) => r.status === 'listed')
                .map((rental) => (
                  <div
                    key={rental.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{rental.spot_number}</span>
                        <span className="text-[10px] text-slate-400">({rental.owner_unit_number})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Available for rent
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-extrabold text-emerald-400">
                        {rental.is_free ? 'FREE' : `$${rental.price_per_week.toFixed(2)}/wk`}
                      </span>

                      <button
                        onClick={() => {
                          bookRentedSpot(rental.id, selectedRenterPlate);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
