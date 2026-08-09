'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Sliders, Save, Trash2, Building } from 'lucide-react';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { config, updateConfig } = useApp();

  const [maxStay, setMaxStay] = useState(config.max_visitor_hours || 24);
  const [demeritThreshold, setDemeritThreshold] = useState(config.demerit_fine_threshold || 3);
  const [fineAmount, setFineAmount] = useState(config.demerit_fine_amount || 50);
  const [totalParks, setTotalParks] = useState(config.total_visitor_parks || 20);
  const [spotPrefix, setSpotPrefix] = useState(config.spot_prefix || 'V-');
  const [weeklyRentCap, setWeeklyRentCap] = useState(config.max_weekly_rental_price || 50);

  const [divisions, setDivisions] = useState<string[]>(
    config.area_divisions && config.area_divisions.length > 0
      ? config.area_divisions
      : ['Ground Floor', 'Basement Level 1']
  );
  const [newDivName, setNewDivName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      max_visitor_hours: maxStay,
      demerit_fine_threshold: demeritThreshold,
      demerit_fine_amount: fineAmount,
      total_visitor_parks: totalParks,
      spot_prefix: spotPrefix,
      area_divisions: divisions,
      max_weekly_rental_price: weeklyRentCap,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDivision = () => {
    if (!newDivName.trim()) return;
    setDivisions([...divisions, newDivName.trim()]);
    setNewDivName('');
  };

  const handleRemoveDivision = (index: number) => {
    setDivisions(divisions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl mx-auto pb-12">
      {/* Admin Header Card */}
      <div className="card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="btn-icon p-1.5 mr-1" aria-label="Back">
              ←
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-danger-soft text-danger flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-ink">
              ADMIN CONTROLS
            </h2>
            <p className="text-xs text-ink-secondary">Building policies, stay limits & rent caps</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="chip chip-success animate-pulse">Settings saved!</span>
        )}
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-4">
        {/* Core Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max Stay */}
          <div className="card p-4 space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">
              MAX VISITOR STAY LIMIT (HOURS)
            </label>
            <input
              type="number"
              value={maxStay}
              onChange={(e) => setMaxStay(parseInt(e.target.value) || 24)}
              className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm"
            />
            <p className="text-[11px] text-ink-tertiary">Default max stay before auto-notify (Default: 24h)</p>
          </div>

          {/* Demerit Threshold */}
          <div className="card p-4 space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">
              DEMERIT PENALTY THRESHOLD
            </label>
            <input
              type="number"
              value={demeritThreshold}
              onChange={(e) => setDemeritThreshold(parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm"
            />
            <p className="text-[11px] text-ink-tertiary">Demerit points required to trigger fine notice (Default: 3 pts)</p>
          </div>

          {/* Fine Amount */}
          <div className="card p-4 space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">
              PENALTY FINE AMOUNT ($)
            </label>
            <input
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(parseInt(e.target.value) || 50)}
              className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm"
            />
            <p className="text-[11px] text-ink-tertiary">Body Corp fine issued on demerit threshold breach</p>
          </div>

          {/* Weekly Spot Rental Cap */}
          <div className="card p-4 space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">
              MAX WEEKLY SPOT RENT CAP ($/WEEK)
            </label>
            <input
              type="number"
              value={weeklyRentCap}
              onChange={(e) => setWeeklyRentCap(parseInt(e.target.value) || 50)}
              className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-sm"
            />
            <p className="text-[11px] text-ink-tertiary">Maximum allowed weekly rent for private spot listings ($50/wk max)</p>
          </div>
        </div>

        {/* Site Layout Configurator */}
        <div className="card p-4 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-2">
            <Building className="w-4 h-4 text-accent" />
            <span>FLAT SITE LAYOUT & VISITOR PARKS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-ink-tertiary block mb-1">
                Total Visitor Parks Count
              </label>
              <input
                type="number"
                value={totalParks}
                onChange={(e) => setTotalParks(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-ink-tertiary block mb-1">
                Spot Naming Prefix
              </label>
              <input
                type="text"
                value={spotPrefix}
                onChange={(e) => setSpotPrefix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg border border-border text-ink font-mono font-bold text-xs"
              />
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <label className="text-[10px] font-bold uppercase text-ink-tertiary block mb-2">
              Building Area / Division Names
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {divisions.map((div, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-bg-surface border border-border text-xs font-bold text-ink flex items-center gap-2"
                >
                  {div}
                  <button
                    type="button"
                    onClick={() => handleRemoveDivision(idx)}
                    className="text-ink-tertiary hover:text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDivName}
                onChange={(e) => setNewDivName(e.target.value)}
                placeholder="e.g. Ground Floor, Basement L1, Front Lot..."
                className="flex-1 px-3 py-2 rounded-xl bg-bg border border-border text-xs text-ink"
              />
              <button
                type="button"
                onClick={handleAddDivision}
                className="px-3 py-2 rounded-xl bg-bg-elevated text-white text-xs font-bold hover:bg-bg-surface"
              >
                Add Area
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-accent hover:bg-accent text-white font-extrabold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Global Configurations</span>
        </button>
      </form>
    </div>
  );
};
