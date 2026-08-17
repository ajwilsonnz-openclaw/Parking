'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface TactileTimePickerProps {
  onTimeChange: (params: {
    hoursFromNow: number;
    formattedTime: string;
    targetDate: Date;
  }) => void;
}

export const TactileTimePicker: React.FC<TactileTimePickerProps> = ({ onTimeChange }) => {
  // Initialize to Current Time + 1 Hour, rounded up to next 15-minute mark
  const [hour, setHour] = useState<number>(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const rawHours = d.getHours();
    const h12 = rawHours % 12 || 12;
    return h12;
  });

  const [minute, setMinute] = useState<number>(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const m = d.getMinutes();
    if (m === 0) return 0;
    if (m <= 15) return 15;
    if (m <= 30) return 30;
    if (m <= 45) return 45;
    return 0;
  });

  const [period, setPeriod] = useState<'am' | 'pm'>(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.getHours() >= 12 ? 'pm' : 'am';
  });

  // Calculate duration and notify parent whenever hour, minute, or period changes
  useEffect(() => {
    const now = new Date();
    const target = new Date(now);

    let h24 = hour;
    if (period === 'pm' && hour < 12) h24 = hour + 12;
    if (period === 'am' && hour === 12) h24 = 0;

    target.setHours(h24, minute, 0, 0);

    // If target time is earlier or equal to now, roll over to tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
    const clampedHours = Math.max(0.25, Math.min(24, Math.round(diffHours * 100) / 100));
    const formatted = `${hour}:${minute.toString().padStart(2, '0')} ${period.toUpperCase()}`;

    onTimeChange({
      hoursFromNow: clampedHours,
      formattedTime: formatted,
      targetDate: target,
    });
  }, [hour, minute, period, onTimeChange]);

  // Increment / Decrement Handlers
  const incrementHour = () => {
    setHour((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const decrementHour = () => {
    setHour((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const incrementMinute = () => {
    setMinute((prev) => {
      if (prev === 0) return 15;
      if (prev === 15) return 30;
      if (prev === 30) return 45;
      // Rollover to next hour
      incrementHour();
      return 0;
    });
  };

  const decrementMinute = () => {
    setMinute((prev) => {
      if (prev === 45) return 30;
      if (prev === 30) return 15;
      if (prev === 15) return 0;
      // Rollback to previous hour
      decrementHour();
      return 45;
    });
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
          Time
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/90">
        {/* Hour & Minute Stepper Grid */}
        <div className="flex items-center gap-1.5">
          {/* Hour Column */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={incrementHour}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Increase hour"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="w-11 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-black text-base text-slate-900 shadow-xs">
              {hour}
            </div>
            <button
              type="button"
              onClick={decrementHour}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Decrease hour"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <span className="font-mono font-black text-slate-400 text-lg mb-0.5">:</span>

          {/* Minute Column */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={incrementMinute}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Increase minutes"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="w-11 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-black text-base text-slate-900 shadow-xs">
              {minute.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={decrementMinute}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Decrease minutes"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* AM / PM Toggle Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPeriod('am')}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-black transition-all ${
              period === 'am'
                ? 'bg-amber-100/90 text-amber-950 border border-amber-300 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            am
          </button>
          <button
            type="button"
            onClick={() => setPeriod('pm')}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-black transition-all ${
              period === 'pm'
                ? 'bg-amber-100/90 text-amber-950 border border-amber-300 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            pm
          </button>
        </div>
      </div>
    </div>
  );
};
