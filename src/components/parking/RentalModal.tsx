'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Carpark } from '@/types';
import { Key, DollarSign, Users, Calendar } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

interface RentalModalProps {
  spot: Carpark;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "Lend my spot" — friendly neighbor spot sharing.
 * Rebranded from RentalModal to remove commercial "rental" language.
 */
export const RentalModal: React.FC<RentalModalProps> = ({ spot, isOpen, onClose }) => {
  const { currentUser, config, rentOutSpot, rentals, bookRentedSpot, vehicles } = useApp();

  const [activeTab, setActiveTab] = useState<'share_mine' | 'browse'>('share_mine');
  const [duration, setDuration] = useState<'weekend' | '1week' | '1month' | 'custom'>('1week');
  const [customWeeks, setCustomWeeks] = useState<number>(2);
  const [cost, setCost] = useState<'free' | 'koha' | 'set'>('free');
  const [amount, setAmount] = useState<number>(0);
  const [selectedRenterPlate, setSelectedRenterPlate] = useState<string>(vehicles[0]?.plate_number || 'GHJ125');

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const weeks = duration === 'custom' ? customWeeks : duration === 'weekend' ? 0.3 : duration === '1week' ? 1 : 4;
    const price = cost === 'free' ? 0 : amount;
    rentOutSpot(spot.spot_number, weeks, price);
    onClose();
  };

  const listedRentals = rentals.filter((r) => r.status === 'listed' && r.spot_number !== spot.spot_number);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-5">
        <div className="icon-tile w-11 h-11">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Lend my spot to a neighbour</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Share while you're away. All in the spirit of good neighbours.</p>
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
          Lend my spot
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
        <form onSubmit={handleShare} className="space-y-4">
          {/* Spot summary */}
          <div className="card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent font-mono font-black flex items-center justify-center text-xs">
              {spot.spot_number}
            </div>
            <div>
              <div className="text-xs font-bold text-ink">{spot.spot_number}</div>
              <div className="text-[11px] text-ink-tertiary">{spot.section}</div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">How long?</label>
            <div className="grid grid-cols-2 gap-2">
              {(['weekend', '1week', '1month', 'custom'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    duration === d ? 'border-accent bg-accent-soft text-accent' : 'border-border text-ink-secondary hover:text-ink'
                  }`}
                >
                  {d === 'weekend' ? 'A weekend' : d === '1week' ? 'About a week' : d === '1month' ? 'A month' : 'Custom'}
                </button>
              ))}
            </div>
            {duration === 'custom' && (
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={customWeeks}
                  onChange={(e) => setCustomWeeks(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <span className="text-xs font-mono font-bold text-accent shrink-0">{customWeeks} weeks</span>
              </div>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">Cost</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCost('free')}
                className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                  cost === 'free' ? 'border-success ring-1 ring-success/25' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  cost === 'free' ? 'border-success bg-success/10' : 'border-border'
                }`}>
                  {cost === 'free' && <div className="w-3 h-3 rounded-full bg-success" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">Free — happy to help</div>
                  <div className="text-[11px] text-ink-secondary">As a favour to the neighbour</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCost('koha')}
                className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                  cost === 'koha' ? 'border-warning ring-1 ring-warning/25' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  cost === 'koha' ? 'border-warning bg-warning/10' : 'border-border'
                }`}>
                  {cost === 'koha' && <div className="w-3 h-3 rounded-full bg-warning" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">Koha / donation</div>
                  <div className="text-[11px] text-ink-secondary">Whatever they feel is right</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCost('set')}
                className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                  cost === 'set' ? 'border-accent ring-1 ring-accent/25' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  cost === 'set' ? 'border-accent bg-accent/10' : 'border-border'
                }`}>
                  {cost === 'set' && <div className="w-3 h-3 rounded-full bg-accent" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">A set amount</div>
                  <div className="text-[11px] text-ink-secondary">A friendly contribution per week</div>
                </div>
                {cost === 'set' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm text-ink-secondary">$</span>
                    <input
                      type="number"
                      min="0"
                      max={config.max_weekly_rental_price}
                      value={amount}
                      onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, config.max_weekly_rental_price))}
                      onClick={(e) => e.stopPropagation()}
                      className="input w-20 px-2 py-1 text-sm font-mono"
                    />
                  </div>
                )}
              </button>
            </div>
            <p className="text-[10px] text-ink-tertiary mt-2 italic">
              Friendly neighbour note, not a commercial transaction. Keep it simple.
            </p>
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
              <p className="text-xs text-ink-tertiary mt-1">Check back later — neighbours share spots when they're away.</p>
            </div>
          ) : (
            listedRentals.map((r) => (
              <div key={r.id} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink text-sm">{r.spot_number}</span>
                    <span className="text-[11px] text-ink-tertiary">({r.owner_unit_number})</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-1">Available to share</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-mono font-extrabold text-success">
                    {r.is_free ? 'Free' : `$${r.price_per_week}`}
                  </span>
                  <button
                    onClick={() => { bookRentedSpot(r.id, selectedRenterPlate); onClose(); }}
                    className="btn-primary text-xs px-3 py-1.5"
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
