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
      const now = Date.now();
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
  const accentColor = timeLeft.isExpired
    ? 'text-danger'
    : timeLeft.progressPercent > 80
    ? 'text-warning'
    : 'text-accent';
  const barColor = timeLeft.isExpired
    ? 'bg-danger'
    : timeLeft.progressPercent > 80
    ? 'bg-warning'
    : 'bg-accent';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
        <Clock className={`w-3.5 h-3.5 ${timeLeft.isExpired ? 'text-danger animate-pulse' : accentColor}`} />
        <span className={timeLeft.isExpired ? 'text-danger font-bold' : 'text-ink-secondary'}>
          {timeLeft.isExpired
            ? 'EXPIRED'
            : `${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`}
        </span>
      </div>
    );
  }

  return (
    <div className="card p-4 flex flex-col items-center justify-center border-t-2 border-t-accent w-full">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3">
        <Clock className={`w-4 h-4 ${accentColor}`} />
        <span>Time Remaining</span>
      </div>

      {timeLeft.isExpired ? (
        <div className="flex flex-col items-center text-danger py-2">
          <AlertCircle className="w-8 h-8 animate-bounce mb-1" />
          <span className="text-lg font-extrabold tracking-wider font-display">SESSION EXPIRED</span>
          <span className="text-xs text-danger/80">Vehicle is over stay limit</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 my-2 font-mono">
          <TimeTile value={timeLeft.hours} label="Hours" />
          <span className={`text-xl font-bold pb-4 ${accentColor}`}>:</span>
          <TimeTile value={timeLeft.minutes} label="Mins" />
          <span className={`text-xl font-bold pb-4 ${accentColor}`}>:</span>
          <TimeTile value={timeLeft.seconds} label="Secs" accentColor={accentColor} />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-border h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${timeLeft.progressPercent}%` }}
        />
      </div>
    </div>
  );
};

function TimeTile({ value, label, accentColor }: { value: number; label: string; accentColor?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl md:text-3xl font-extrabold ${accentColor || 'text-ink'} bg-bg-surface px-3 py-1.5 rounded-xl border border-border shadow-sm`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-ink-tertiary uppercase mt-1 font-bold">{label}</span>
    </div>
  );
}
