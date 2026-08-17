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
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-extrabold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Duration / End Time
        </span>
      </div>

      <div
        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderColor: 'var(--card-border)',
        }}
      >
        {/* Hour & Minute Stepper Grid */}
        <div className="flex items-center gap-1.5">
          {/* Hour Column */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={incrementHour}
              className="w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all hover:text-white"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'var(--card-border)',
                color: 'var(--accent-secondary)',
                boxShadow: '0 0 8px var(--ambient-glow)',
              }}
              aria-label="Increase hour"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div
              className="w-10 h-9 rounded-xl border flex items-center justify-center font-mono font-black text-sm text-white shadow-xs"
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderColor: 'var(--card-border)',
              }}
            >
              {hour}
            </div>
            <button
              type="button"
              onClick={decrementHour}
              className="w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all hover:text-white"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'var(--card-border)',
                color: 'var(--accent-secondary)',
                boxShadow: '0 0 8px var(--ambient-glow)',
              }}
              aria-label="Decrease hour"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <span
            className="font-mono font-black text-base mb-0.5 opacity-60"
            style={{ color: 'var(--accent-secondary)' }}
          >
            :
          </span>

          {/* Minute Column */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={incrementMinute}
              className="w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all hover:text-white"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'var(--card-border)',
                color: 'var(--accent-secondary)',
                boxShadow: '0 0 8px var(--ambient-glow)',
              }}
              aria-label="Increase minutes"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div
              className="w-10 h-9 rounded-xl border flex items-center justify-center font-mono font-black text-sm text-white shadow-xs"
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderColor: 'var(--card-border)',
              }}
            >
              {minute.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={decrementMinute}
              className="w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all hover:text-white"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderColor: 'var(--card-border)',
                color: 'var(--accent-secondary)',
                boxShadow: '0 0 8px var(--ambient-glow)',
              }}
              aria-label="Decrease minutes"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* AM / PM Segment Toggle */}
        <div
          className="flex p-1 rounded-xl border"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderColor: 'var(--card-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setPeriod('am')}
            className="py-2 px-3 rounded-lg text-xs font-black transition-all"
            style={{
              background: period === 'am' ? 'var(--accent-gradient)' : 'transparent',
              color: period === 'am' ? '#020617' : 'var(--text-muted)',
              boxShadow: period === 'am' ? '0 0 10px var(--ambient-glow)' : 'none',
            }}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => setPeriod('pm')}
            className="py-2 px-3 rounded-lg text-xs font-black transition-all"
            style={{
              background: period === 'pm' ? 'var(--accent-gradient)' : 'transparent',
              color: period === 'pm' ? '#020617' : 'var(--text-muted)',
              boxShadow: period === 'pm' ? '0 0 10px var(--ambient-glow)' : 'none',
            }}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};
