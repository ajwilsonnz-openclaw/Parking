'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  expectedEndTime: string;
  startTime: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expectedEndTime,
  startTime,
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    progressPercent: number;
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false, progressPercent: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startTime).getTime();
      const end = new Date(expectedEndTime).getTime();
      const now = new Date().getTime();
      const totalDuration = Math.max(1, end - start);
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true, progressPercent: 100 });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      const elapsed = now - start;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      setTimeLeft({ hours, minutes, seconds, isExpired: false, progressPercent });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expectedEndTime, startTime, onExpire]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
        <Clock className={`w-3.5 h-3.5 ${timeLeft.isExpired ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
        <span className={timeLeft.isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}>
          {timeLeft.isExpired
            ? 'EXPIRED'
            : `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-sky-500">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        <Clock className="w-4 h-4 text-sky-400" />
        <span>Time Remaining</span>
      </div>

      {timeLeft.isExpired ? (
        <div className="flex flex-col items-center text-rose-400 py-2">
          <AlertCircle className="w-8 h-8 animate-bounce mb-1" />
          <span className="text-xl font-extrabold tracking-wider">SESSION EXPIRED</span>
          <span className="text-xs text-rose-300/80">Vehicle is over stay limit!</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 my-2 font-mono">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase mt-1">Hours</span>
          </div>
          <span className="text-2xl font-bold text-sky-400 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase mt-1">Mins</span>
          </div>
          <span className="text-2xl font-bold text-sky-400 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-sky-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              {pad(timeLeft.seconds)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase mt-1">Secs</span>
          </div>
        </div>
      )}

      {/* Progress ring / bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft.isExpired
              ? 'bg-rose-500'
              : timeLeft.progressPercent > 80
              ? 'bg-amber-500'
              : 'bg-sky-500'
          }`}
          style={{ width: `${timeLeft.progressPercent}%` }}
        />
      </div>
    </div>
  );
};
