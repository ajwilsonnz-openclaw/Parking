'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Sliders, Save, Building2, Ruler, Car, AlertTriangle, ArrowLeft, Plus, Minus } from 'lucide-react';

interface AdminViewProps {
  onBack?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const { config, updateConfig } = useApp();

  const [complexName, setComplexName] = useState(config.complex_name);
  const [complexAddress, setComplexAddress] = useState(config.complex_address || '');
  const [headerIcon, setHeaderIcon] = useState(config.header_icon || 'building');
  const [maxStay, setMaxStay] = useState(config.max_visitor_hours || 24);
  const [residentMaxStay, setResidentMaxStay] = useState(config.max_resident_excess_hours || 12);
  const [demeritThreshold, setDemeritThreshold] = useState(config.demerit_fine_threshold || 3);
  const [fineAmount, setFineAmount] = useState(config.demerit_fine_amount || 50);
  const [totalParks, setTotalParks] = useState(config.total_visitor_parks || 20);
  const [spotPrefix, setSpotPrefix] = useState(config.spot_prefix || 'V');
  const [weeklyRentCap, setWeeklyRentCap] = useState(config.max_weekly_rental_price || 50);
  const [totalUnits, setTotalUnits] = useState(40);

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
        </Section>

        {/* Stay Limits */}
        <Section icon={<Ruler className="w-4 h-4" />} title="Stay limits">
          <div className="grid grid-cols-2 gap-3">
            <StepperField label="Visitor Max (Hours)" value={maxStay} onChange={setMaxStay} min={1} max={168} step={1} />
            <StepperField label="Resident Excess Max (Hours)" value={residentMaxStay} onChange={setResidentMaxStay} min={1} max={168} step={1} />
          </div>
        </Section>

        {/* Penalties */}
        <Section icon={<AlertTriangle className="w-4 h-4" />} title="Demerit penalties">
          <div className="grid grid-cols-2 gap-3">
            <StepperField label="Threshold (Points)" value={demeritThreshold} onChange={setDemeritThreshold} min={1} max={10} step={1} />
            <StepperField label="Fine Amount ($)" value={fineAmount} onChange={setFineAmount} min={0} max={500} step={5} />
          </div>
          <p className="text-[11px] text-ink-tertiary mt-1.5">
            When cumulative demerits hit the threshold, a Body Corp fine is issued automatically.
          </p>
        </Section>

        {/* Site Layout */}
        <Section icon={<Car className="w-4 h-4" />} title="Site layout">
          <div className="grid grid-cols-2 gap-3">
            <StepperField label="Total Visitor Parks" value={totalParks} onChange={setTotalParks} min={1} max={100} step={1} />
            <div>
              <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                Spot Prefix
              </label>
              <input type="text" value={spotPrefix} onChange={(e) => setSpotPrefix(e.target.value)}
                className="input font-mono font-bold text-center text-sm" />
              <p className="text-[10px] text-ink-tertiary mt-1">e.g. V → V01, V02, ...</p>
            </div>
          </div>

          <div className="mt-3">
            <StepperField label="Rent Cap per Week ($)" value={weeklyRentCap} onChange={setWeeklyRentCap} min={0} max={500} step={5} />
            <p className="text-[10px] text-ink-tertiary mt-1">Maximum weekly rent when residents share a personal carpark</p>
          </div>
        </Section>

        {/* Units */}
        <Section icon={<Building2 className="w-4 h-4" />} title="Building units">
          <StepperField label="Number of Residential Units" value={totalUnits} onChange={setTotalUnits} min={1} max={300} step={1} />
          <p className="text-[10px] text-ink-tertiary mt-1">Used for addressing and to scope resident counts</p>
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

function StepperField({ label, value, onChange, min = 0, max = 100, step = 1 }: { label: string; value: number; onChange: (val: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="btn-icon p-2 bg-bg-surface hover:bg-border border border-border shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-mono text-base font-black px-3 text-ink flex-1 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="btn-icon p-2 bg-bg-surface hover:bg-border border border-border shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
