'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Sliders, Save, Building2, Ruler, Car, AlertTriangle, ArrowLeft } from 'lucide-react';

interface AdminViewProps {
  onBack?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const { config, updateConfig } = useApp();

  const [complexName, setComplexName] = useState(config.complex_name);
  const [complexAddress, setComplexAddress] = useState(config.complex_address || '');
  const [headerIcon, setHeaderIcon] = useState(config.header_icon || 'building');
  const [maxStay, setMaxStay] = useState(config.max_visitor_hours);
  const [residentMaxStay, setResidentMaxStay] = useState(config.max_resident_excess_hours);
  const [demeritThreshold, setDemeritThreshold] = useState(config.demerit_fine_threshold);
  const [fineAmount, setFineAmount] = useState(config.demerit_fine_amount);
  const [totalParks, setTotalParks] = useState(config.total_visitor_parks);
  const [spotPrefix, setSpotPrefix] = useState(config.spot_prefix);
  const [weeklyRentCap, setWeeklyRentCap] = useState(config.max_weekly_rental_price);
  const [totalUnits, setTotalUnits] = useState(40); // current building has 40 units

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateConfig({
        complex_name: complexName,
        complex_address: complexAddress,
        header_icon: headerIcon,
        max_visitor_hours: maxStay,
        max_resident_excess_hours: residentMaxStay,
        demerit_fine_threshold: demeritThreshold,
        demerit_fine_amount: fineAmount,
        total_visitor_parks: totalParks,
        spot_prefix: spotPrefix,
        max_weekly_rental_price: weeklyRentCap,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="card p-5 flex items-start gap-3">
        {onBack && (
          <button onClick={onBack} className="btn-icon p-2 shrink-0" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="icon-tile w-10 h-10 bg-danger-soft text-danger">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-ink tracking-tight font-display">Admin Controls</h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Building policies, stay limits, fines, rents &amp; site layout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-3.5 bg-danger-soft border-danger/25 text-danger text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Building Identity */}
        <Section icon={<Building2 className="w-4 h-4" />} title="Building identity">
          <Field label="Complex name" value={complexName} onChange={(e) => setComplexName(e.target.value)} required />
          <Field label="Street address" value={complexAddress} onChange={(e) => setComplexAddress(e.target.value)} required />
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider">
              Header Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'building', icon: <Building2 className="w-5 h-5" />, label: 'Building' },
                { id: 'car', icon: <Car className="w-5 h-5" />, label: 'Car' },
                { id: 'shield', icon: <Building2 className="w-5 h-5" />, label: 'Shield' },
                { id: 'zap', icon: <Sliders className="w-5 h-5" />, label: 'Power' },
                { id: 'compass', icon: <Building2 className="w-5 h-5" />, label: 'Compass' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHeaderIcon(item.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    headerIcon === item.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Stay Limits */}
        <Section icon={<Ruler className="w-4 h-4" />} title="Stay limits">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Visitor max (hours)
              </label>
              <input type="number" min={1} max={168} value={maxStay} onChange={(e) => setMaxStay(parseInt(e.target.value) || 24)}
                className="input font-mono font-bold text-center" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Resident excess max (hours)
              </label>
              <input type="number" min={1} max={168} value={residentMaxStay} onChange={(e) => setResidentMaxStay(parseInt(e.target.value) || 12)}
                className="input font-mono font-bold text-center" />
            </div>
          </div>
        </Section>

        {/* Penalties */}
        <Section icon={<AlertTriangle className="w-4 h-4" />} title="Demerit penalties">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Threshold (points)
              </label>
              <input type="number" min={1} max={10} value={demeritThreshold} onChange={(e) => setDemeritThreshold(parseInt(e.target.value) || 3)}
                className="input font-mono font-bold text-center" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Fine amount ($)
              </label>
              <input type="number" min={0} max={500} value={fineAmount} onChange={(e) => setFineAmount(parseInt(e.target.value) || 50)}
                className="input font-mono font-bold text-center" />
            </div>
          </div>
          <p className="text-[11px] text-ink-tertiary mt-1.5">
            When cumulative demerits hit the threshold, a Body Corp fine is issued automatically.
          </p>
        </Section>

        {/* Site Layout */}
        <Section icon={<Car className="w-4 h-4" />} title="Site layout">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Total visitor parks
              </label>
              <input type="number" min={1} max={100} value={totalParks} onChange={(e) => setTotalParks(parseInt(e.target.value) || 20)}
                className="input font-mono font-bold text-center" />
              <p className="text-[10px] text-ink-tertiary mt-1">Total parks available for visitors</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Spot prefix
              </label>
              <input type="text" value={spotPrefix} onChange={(e) => setSpotPrefix(e.target.value)}
                className="input font-mono font-bold text-center" />
              <p className="text-[10px] text-ink-tertiary mt-1">e.g. V → V01, V02, ...</p>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Rent cap (per week)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-ink font-bold font-mono">$</span>
              <input type="number" min={0} max={200} value={weeklyRentCap} onChange={(e) => setWeeklyRentCap(parseInt(e.target.value) || 50)}
                className="input font-mono font-bold text-center" />
            </div>
            <p className="text-[10px] text-ink-tertiary mt-1">Maximum weekly rent when residents share a personal carpark</p>
          </div>
        </Section>

        {/* Units (informational - count of units in this building) */}
        <Section icon={<Building2 className="w-4 h-4" />} title="Building units">
          <div>
            <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Number of residential units
            </label>
            <input type="number" min={1} max={200} value={totalUnits} onChange={(e) => setTotalUnits(parseInt(e.target.value) || 40)}
              className="input font-mono font-bold text-center" />
            <p className="text-[10px] text-ink-tertiary mt-1">Used for addressing and to scope resident counts</p>
          </div>
        </Section>

        {/* Save */}
        <button type="submit" disabled={isSaving} className="btn-primary w-full py-3.5">
          {isSaving ? 'Saving...' : savedSuccess ? 'Saved!' : (
            <>
              <Save className="w-4 h-4" /> Save global settings
            </>
          )}
        </button>
      </form>
    </div>
  );
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2 text-text">
        <div className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-sm font-extrabold">{title}</h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
        {label}{required && ' *'}
      </label>
      <input
        value={value}
        onChange={onChange}
        required={required}
        className="input text-sm"
      />
    </div>
  );
}
