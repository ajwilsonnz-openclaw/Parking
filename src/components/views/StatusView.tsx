'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Search, ShieldAlert, Car, Clock, UserCheck, Users } from 'lucide-react';
import { fmtTimeRange } from '@/lib/format';

export const StatusView: React.FC = () => {
  const { sessions, currentUser } = useApp();
  const [query, setQuery] = useState<string>('');

  const searchQuery = query.trim().toLowerCase();
  const activeSessions = useMemo(() => sessions.filter((s) => s.is_active), [sessions]);

  const matchingSessions = useMemo(() => {
    if (!searchQuery) return activeSessions;
    return activeSessions.filter(
      (s) =>
        s.spot_number.toLowerCase().includes(searchQuery) ||
        s.vehicle_plate.toLowerCase().includes(searchQuery) ||
        s.unit_number.toLowerCase().includes(searchQuery) ||
        (s.visitor_name ?? '').toLowerCase().includes(searchQuery)
    );
  }, [activeSessions, searchQuery]);

  const userUnit = currentUser?.unit_number || '4';

  // Split matching sessions into "Your Guests" and "Other Guests"
  const yourGuests = useMemo(() => {
    return matchingSessions.filter(
      (s) => s.unit_number === userUnit || s.user_id === currentUser?.id
    );
  }, [matchingSessions, userUnit, currentUser]);

  const otherGuests = useMemo(() => {
    return matchingSessions.filter(
      (s) => s.unit_number !== userUnit && s.user_id !== currentUser?.id
    );
  }, [matchingSessions, userUnit, currentUser]);

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto pb-28 pt-1 select-none text-slate-100 px-1">
      {/* Compact Search bar */}
      <div className="relative">
        <Search
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60"
          style={{ color: 'var(--accent-secondary)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plate, spot (V01), or unit..."
          className="w-full pl-10 pr-4 py-2.5 text-xs text-white rounded-2xl focus:outline-none shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-heading)',
          }}
        />
      </div>

      {matchingSessions.length === 0 ? (
        <div
          className="rounded-3xl p-8 text-center space-y-2 border transition-all"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {query ? (
            <>
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto opacity-90" />
              <h3 className="text-sm font-extrabold text-white">No active authorisation found</h3>
              <p className="text-xs max-w-[260px] mx-auto" style={{ color: 'var(--text-muted)' }}>
                No active parking session matches <span className="font-mono font-bold text-white">"{query}"</span>.
              </p>
            </>
          ) : (
            <>
              <Car
                className="w-10 h-10 mx-auto opacity-60"
                style={{ color: 'var(--accent-secondary)' }}
              />
              <h3 className="text-sm font-extrabold text-white">No active parking sessions</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                There are no vehicles currently parked in visitor bays.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section 1: Your Guests */}
          {yourGuests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div
                  className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                  <span>Your Guests ({yourGuests.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {yourGuests.map((session) => (
                  <CompactStatusCard key={session.id} session={session} isYourGuest={true} />
                ))}
              </div>
            </div>
          )}

          {/* Slight Separation Line if both exist */}
          {yourGuests.length > 0 && otherGuests.length > 0 && (
            <div
              className="border-t my-3"
              style={{ borderColor: 'var(--card-border)' }}
            />
          )}

          {/* Section 2: Other Guests */}
          {otherGuests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div
                  className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Users className="w-3.5 h-3.5 opacity-70" />
                  <span>Other Guests ({otherGuests.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {otherGuests.map((session) => (
                  <CompactStatusCard key={session.id} session={session} isYourGuest={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { PlateCard } from '@/components/ui/PlateCard';

function CompactStatusCard({
  session,
  isYourGuest,
}: {
  session: ReturnType<typeof useApp>['sessions'][number];
  isYourGuest: boolean;
}) {
  const rawNumber = session.spot_number.replace('-', '').toUpperCase();

  return (
    <div
      className="p-3 rounded-2xl border transition-all flex items-center justify-between gap-3"
      style={{
        backgroundColor: isYourGuest ? 'var(--card-elevated)' : 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: isYourGuest ? '0 0 15px var(--ambient-glow)' : 'none',
      }}
    >
      {/* Spot Badge + Vehicle Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black text-xs shrink-0"
          style={{
            background: isYourGuest ? 'var(--accent-gradient)' : 'rgba(0,0,0,0.4)',
            color: isYourGuest ? '#020617' : 'var(--accent-secondary)',
            border: isYourGuest ? 'none' : '1px solid var(--card-border)',
            boxShadow: isYourGuest ? '0 0 10px var(--ambient-glow)' : 'none',
          }}
        >
          {rawNumber}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PlateCard plate={session.vehicle_plate} size="xs" showScrews={true} />
            {session.visitor_name && (
              <span className="text-xs font-black text-white truncate max-w-[120px]">
                {session.visitor_name}
              </span>
            )}
          </div>
          <div
            className="text-[10px] font-semibold mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {(session.unit_number || '').startsWith('Unit') ? session.unit_number : `Unit ${session.unit_number}`} · {fmtTimeRange(session.start_time, session.expected_end_time)}
          </div>
        </div>
      </div>

      {/* High-Contrast Countdown Timer */}
      <div className="text-right shrink-0">
        <CountdownCompact end={session.expected_end_time} />
      </div>
    </div>
  );
}

function CountdownCompact({ end }: { end: string }) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const t = setInterval(forceUpdate, 1000);
    return () => clearInterval(t);
  }, []);

  const ms = new Date(end).getTime() - Date.now();
  if (ms <= 0) {
    return (
      <div className="flex items-center gap-1 font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-rose-500 text-slate-950 shadow-md">
        <span>EXPIRED</span>
      </div>
    );
  }
  const diffMins = Math.floor(ms / 60000);
  const isUrgent = diffMins <= 15;

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const text = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;

  return (
    <div
      className={`flex items-center gap-1.5 font-mono font-black text-xs px-2.5 py-1 rounded-xl border transition-all ${
        isUrgent
          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
          : 'bg-black/60 border-slate-700 text-slate-100'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-slate-950' : 'text-slate-400'}`} />
      <span>{text}</span>
    </div>
  );
}
