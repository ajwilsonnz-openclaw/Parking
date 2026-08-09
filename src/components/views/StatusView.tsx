'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Search, ShieldAlert, Car, Eye, Clock } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { fmtTimeRange } from '@/lib/format';

/**
 * "Status" - verify which vehicles are authorised to be parked right now.
 */
export const StatusView: React.FC = () => {
  const { sessions } = useApp();
  const [query, setQuery] = useState<string>('');

  const searchQuery = query.trim().toLowerCase();
  const activeSessions = sessions.filter((s) => s.is_active);

  const matchingSessions = searchQuery
    ? activeSessions.filter(
        (s) =>
          s.spot_number.toLowerCase().includes(searchQuery) ||
          s.vehicle_plate.toLowerCase().includes(searchQuery) ||
          s.unit_number.toLowerCase().includes(searchQuery) ||
          (s.visitor_name ?? '').toLowerCase().includes(searchQuery)
      )
    : activeSessions;

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto pb-32">
      {/* Header */}
      <div className="card p-4 flex items-center gap-3">
        <div className="icon-tile w-11 h-11 shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-ink">Vehicle Verification</h2>
          <p className="text-xs text-ink-secondary">Search a spot, plate or unit</p>
        </div>
        <span className="chip chip-accent shrink-0">
          <Car className="w-3 h-3" /> {activeSessions.length} active
        </span>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-tertiary absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Visitor 3, V03, GHJ125, Unit 12…"
          className="input pl-11 text-sm"
        />
      </div>

      {/* Results */}
      {matchingSessions.length === 0 ? (
        <div className="card p-8 text-center">
          {query ? (
            <>
              <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3 opacity-90" />
              <h3 className="text-base font-extrabold text-ink">No authorisation found</h3>
              <p className="text-xs text-ink-secondary mt-1.5 max-w-[280px] mx-auto">
                No active parking session matches <span className="font-mono font-bold">"{query}"</span>. This vehicle may be unauthorised.
              </p>
            </>
          ) : (
            <>
              <Car className="w-12 h-12 text-ink-tertiary mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-extrabold text-ink">No active sessions</h3>
              <p className="text-xs text-ink-secondary mt-1.5">
                There are no vehicles parked in visitor spaces right now.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {matchingSessions.map((session) => {
            const longName = session.spot_number.startsWith('V')
              ? `Visitor ${session.spot_number.substring(1)}`
              : session.spot_number;
            return (
              <StatusCard
                key={session.id}
                spotShort={session.spot_number}
                spotLong={longName}
                session={session}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

function StatusCard({
  spotShort,
  spotLong,
  session,
}: {
  spotShort: string;
  spotLong: string;
  session: ReturnType<typeof useApp>['sessions'][number];
}) {
  return (
    <div className="card p-4 space-y-3">
      {/* Top: spot + status chip */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-black text-sm shrink-0 border border-accent-border">
            {spotShort}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-ink">{spotLong}</div>
            <div className="text-[11px] text-ink-tertiary font-medium">
              {fmtTimeRange(session.start_time, session.expected_end_time)}
            </div>
          </div>
        </div>
        <span
          className={`chip shrink-0 ${
            session.session_type === 'resident_excess' ? 'chip-warning' : 'chip-success'
          }`}
        >
          {session.session_type === 'resident_excess' ? 'Resident' : 'Visitor'}
        </span>
      </div>

      {/* Middle: plate + registered by */}
      <div className="flex items-center gap-3 pl-1">
        <PlateCard plate={session.vehicle_plate} size="sm" />
        <div className="min-w-0 flex-1 text-xs">
          <div className="text-ink-secondary">
            <span className="text-ink-tertiary">Registered by </span>
            <strong className="text-ink font-bold">{session.unit_number}</strong>
          </div>
          {session.visitor_name && (
            <div className="text-ink-tertiary mt-0.5">Visitor: {session.visitor_name}</div>
          )}
        </div>
      </div>

      {/* Bottom: countdown quick view */}
      <div className="pt-2 border-t border-border flex items-center gap-2 text-xs">
        <Clock className="w-3.5 h-3.5 text-ink-tertiary" />
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
    return <span className="font-bold text-danger text-xs">EXPIRED</span>;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const text = h > 0 ? `${h}h ${m}m ${s}s remaining` : m > 0 ? `${m}m ${s}s remaining` : `${s}s remaining`;
  return <span className="font-mono font-bold text-ink-secondary text-xs">{text}</span>;
}
