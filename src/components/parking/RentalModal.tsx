'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Carpark } from '@/types';
import { Key, Users, Calendar, DollarSign } from 'lucide-react';

interface RentalModalProps {
  spot: Carpark;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "Lend my spot to a neighbour" — generous spirit, donation-oriented.
 */
export const RentalModal: React.FC<RentalModalProps> = ({ spot, isOpen, onClose }) => {
  const { currentUser, config, rentOutSpot, rentals, bookRentedSpot, vehicles } = useApp();

  const [activeTab, setActiveTab] = useState<'share_mine' | 'browse'>('share_mine');

  // Date range (indefinite option)
  const [indefinite, setIndefinite] = useState<boolean>(true);
  const todayIso = new Date().toISOString().slice(0, 10);
  const twoWeeksFromNow = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState<string>(todayIso);
  const [untilDate, setUntilDate] = useState<string>(twoWeeksFromNow);

  // Cost
  const [costType, setCostType] = useState<'free' | 'donation' | 'set'>('free');
  const [setAmount, setSetAmount] = useState<number>(20);

  const [selectedPlate, setSelectedPlate] = useState<string>(vehicles[0]?.plate_number || '');

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const weeks = indefinite
      ? 52 // "indefinite" = approx 1 year
      : Math.max(0.1, (new Date(untilDate).getTime() - new Date(fromDate).getTime()) / (7 * 86400000));
    const price = costType === 'free' ? 0 : costType === 'donation' ? 0 : setAmount;
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
          <p className="text-xs text-ink-secondary mt-0.5">Share it while you're away — all in the spirit of good neighbours.</p>
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
        <form onSubmit={handleShare} className="space-y-5">
          {/* Spot summary */}
          <div className="card p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent font-mono font-black flex items-center justify-center text-sm border border-accent-border">
              {spot.spot_number}
            </div>
            <div>
              <div className="text-sm font-bold text-ink">{spot.spot_number}</div>
              <div className="text-[11px] text-ink-tertiary">Your assigned park</div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              When is it available?
            </label>

            {/* Indefinite toggle */}
            <button
              type="button"
              onClick={() => setIndefinite(!indefinite)}
              className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                indefinite ? 'border-accent ring-1 ring-accent/25' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                indefinite ? 'border-accent bg-accent/10' : 'border-border'
              }`}>
                {indefinite && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-ink">Indefinitely</div>
                <div className="text-[11px] text-ink-secondary">Until I turn it off</div>
              </div>
            </button>

            {/* Specific date range */}
            {!indefinite && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    min={todayIso}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">Until</label>
                  <input
                    type="date"
                    value={untilDate}
                    min={fromDate}
                    onChange={(e) => setUntilDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Cost for the neighbour
            </label>

            <CostOption
              selected={costType === 'free'}
              onClick={() => setCostType('free')}
              title="Free — happy to help"
              subtitle="As a favour to the neighbour"
            />
            <CostOption
              selected={costType === 'donation'}
              onClick={() => setCostType('donation')}
              title="Donation"
              subtitle="Whatever they feel is right — give what they can"
            />
            <CostOption
              selected={costType === 'set'}
              onClick={() => setCostType('set')}
              title="A set amount"
              subtitle="A friendly weekly contribution"
              trailing={
                costType === 'set' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm text-ink-secondary">$</span>
                    <input
                      type="number"
                      min="0"
                      max={config.max_weekly_rental_price}
                      value={setAmount}
                      onChange={(e) => setSetAmount(Math.min(parseFloat(e.target.value) || 0, config.max_weekly_rental_price))}
                      onClick={(e) => e.stopPropagation()}
                      className="input w-20 px-2 py-1 text-sm font-mono"
                    />
                    <span className="text-[11px] text-ink-tertiary">/wk</span>
                  </div>
                ) : undefined
              }
            />

            <p className="text-[10px] text-ink-tertiary italic pt-1">
              A friendly neighbour note, not a commercial transaction.
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

function CostOption({
  selected,
  onClick,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
        selected ? 'border-accent ring-1 ring-accent/25' : ''
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? 'border-accent bg-accent/10' : 'border-border'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-accent" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-ink">{title}</div>
        <div className="text-[11px] text-ink-secondary">{subtitle}</div>
      </div>
      {trailing}
    </button>
  );
}
