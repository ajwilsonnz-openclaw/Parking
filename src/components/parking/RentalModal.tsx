'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Carpark } from '@/types';
import { Key, Users } from 'lucide-react';

interface RentalModalProps {
  spot?: Carpark | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "Make personal carpark available" - let a neighbour use your spot while you're away.
 */
export const RentalModal: React.FC<RentalModalProps> = ({ spot, isOpen, onClose }) => {
  const { currentUser, config, rentOutSpot, rentals, bookRentedSpot, vehicles, carparks } = useApp();

  const defaultSpot: Carpark = {
    id: 'p-default',
    spot_number: currentUser?.unit_number ? `Spot ${currentUser.unit_number.replace(/\D/g, '')}` : 'My Spot',
    section: 'Ground',
    status: 'available',
    owner_unit_number: currentUser?.unit_number,
  };

  const activeSpot = spot || carparks.find((c) => c.owner_unit_number === currentUser?.unit_number) || defaultSpot;

  const [activeTab, setActiveTab] = useState<'share_mine' | 'browse'>('share_mine');

  // Dates
  const [indefinite, setIndefinite] = useState<boolean>(true);
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultUntil = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const [untilDate, setUntilDate] = useState<string>(defaultUntil);

  // Per-week price
  const [isFree, setIsFree] = useState<boolean>(true);
  const [setAmount, setSetAmount] = useState<number>(20);

  // For reserve flow (browsing)
  const [selectedPlate, setSelectedPlate] = useState<string>(vehicles[0]?.plate_number || '');

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const weeks = indefinite
      ? 52 // ~1 year for "indefinite"
      : Math.max(0.14, (new Date(untilDate).getTime() - new Date(todayIso).getTime()) / (7 * 86400000));
    const price = isFree ? 0 : setAmount;
    rentOutSpot(activeSpot.spot_number, weeks, price);
    onClose();
  };

  const listedRentals = rentals.filter((r) => r.status === 'listed' && r.spot_number !== activeSpot.spot_number);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-5">
        <div className="icon-tile w-11 h-11">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Make personal carpark available</h3>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="card p-1 grid grid-cols-2 gap-1 mb-5">
        <button
          onClick={() => setActiveTab('share_mine')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'share_mine' ? 'text-accent bg-accent-soft shadow' : 'text-ink-tertiary hover:text-ink'
          }`}
        >
          Share my spot
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'browse' ? 'text-accent bg-accent-soft shadow' : 'text-ink-tertiary hover:text-ink'
          }`}
        >
          Available ({listedRentals.length})
        </button>
      </div>

      {activeTab === 'share_mine' ? (
        <form onSubmit={handleShare} className="space-y-5">
          {/* Spot summary */}
          <div className="card p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent font-mono font-black flex items-center justify-center text-sm border border-accent-border">
              {spot.spot_number}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-ink">{spot.spot_number}</div>
              <div className="text-[11px] text-ink-tertiary">Unit {currentUser?.unit_number?.replace(/^Unit\s+/i, '') || ''}</div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              When is it available?
            </label>

            {/* Indefinitely option */}
            <button
              type="button"
              onClick={() => setIndefinite(true)}
              className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                indefinite ? 'border-accent ring-1 ring-accent/25' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                indefinite ? 'border-accent bg-accent/10' : 'border-border'
              }`}>
                {indefinite && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-ink">Indefinitely</div>
                <div className="text-[11px] text-ink-secondary">Until I turn it off</div>
              </div>
            </button>

            {/* Until a specific date (calendar) */}
            <button
              type="button"
              onClick={() => setIndefinite(false)}
              className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                !indefinite ? 'border-accent ring-1 ring-accent/25' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !indefinite ? 'border-accent bg-accent/10' : 'border-border'
              }`}>
                {!indefinite && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-ink">Until a specific date</div>
              </div>
            </button>

            {/* Calendar when "Until" chosen */}
            {!indefinite && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">Available until</label>
                <input
                  type="date"
                  value={untilDate}
                  min={todayIso}
                  onChange={(e) => setUntilDate(e.target.value)}
                  className="input text-sm"
                />
              </div>
            )}
          </div>

          {/* Per Week Price */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Per week price
            </label>

            {/* Free option */}
            <button
              type="button"
              onClick={() => setIsFree(true)}
              className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                isFree ? 'border-success ring-1 ring-success/25' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isFree ? 'border-success bg-success/10' : 'border-border'
              }`}>
                {isFree && <div className="w-3 h-3 rounded-full bg-success" />}
              </div>
              <div className="text-sm font-bold text-ink">Free</div>
            </button>

            {/* Set amount */}
            <button
              type="button"
              onClick={() => setIsFree(false)}
              className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                !isFree ? 'border-accent ring-1 ring-accent/25' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !isFree ? 'border-accent bg-accent/10' : 'border-border'
              }`}>
                {!isFree && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-ink">A set amount</div>
                <div className="text-[11px] text-ink-secondary">Max: ${config.max_weekly_rental_price.toFixed(0)} per week</div>
              </div>
              {!isFree && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm text-ink-secondary">$</span>
                  <input
                    type="number"
                    min="0"
                    max={config.max_weekly_rental_price}
                    step="1"
                    value={setAmount}
                    onChange={(e) =>
                      setSetAmount(
                        Math.min(parseFloat(e.target.value) || 0, config.max_weekly_rental_price)
                      )
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="input w-20 px-2 py-1 text-sm font-mono"
                  />
                  <span className="text-[11px] text-ink-tertiary">/wk</span>
                </div>
              )}
            </button>
          </div>

          <button type="submit" className="btn-primary w-full">
            Make my spot available
          </button>
        </form>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto -mx-1 px-1">
          {listedRentals.length === 0 ? (
            <div className="card p-6 text-center">
              <Users className="w-8 h-8 text-ink-tertiary mx-auto mb-2 opacity-60" />
              <span className="text-sm font-bold text-ink block">No spots listed right now</span>
              <p className="text-xs text-ink-tertiary mt-1">Check back later - neighbours share spots when they're away.</p>
            </div>
          ) : (
            listedRentals.map((r) => (
              <div key={r.id} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink text-sm">{r.spot_number}</span>
                    <span className="text-[11px] text-ink-tertiary">({r.owner_unit_number})</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-1">Available to reserve</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-mono font-extrabold text-success">
                    {r.is_free ? 'Free' : `$${r.price_per_week.toFixed(0)}`}
                  </span>
                  <button
                    onClick={() => { bookRentedSpot(r.id, selectedPlate); onClose(); }}
                    disabled={!selectedPlate}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                  >
                    Reserve it
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};
