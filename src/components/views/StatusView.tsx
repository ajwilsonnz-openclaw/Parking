'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Search, ShieldAlert, CheckCircle2, Car, Eye } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { CountdownTimer } from '@/components/parking/CountdownTimer';
import { fmtTimeRange } from '@/lib/format';

/**
 * "Status" view — verify if a vehicle is authorized to park.
 * Was VerifyView; rebranded to match the new tab name.
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
          s.unit_number.toLowerCase().includes(searchQuery)
      )
    : activeSessions;

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto pb-4">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-tile w-10 h-10">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-ink">
              Vehicle Verification
            </h2>
            <p className="text-xs text-ink-tertiary">Search spot or plate for authorization</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase text-ink-tertiary block">Active</span>
          <span className="text-base font-black text-accent">{activeSessions.length} vehicles</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="card p-2">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spot (V-03) or plate (GHJ125)…"
            className="input pl-10 font-mono text-xs uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2.5">
        {matchingSessions.length === 0 ? (
          <div className="card p-6 text-center border-l-4 border-l-danger">
            <ShieldAlert className="w-10 h-10 text-danger mx-auto mb-2" />
            <h3 className="text-sm font-extrabold uppercase text-danger">Unverified vehicle</h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-sm mx-auto">
              No active parking session found for <span className="font-mono font-bold">"{query}"</span>. The vehicle may be unauthorized.
            </p>
          </div>
        ) : (
          matchingSessions.map((session) => (
            <div key={session.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="px-2.5 py-1 rounded-xl bg-bg-surface font-mono font-black text-ink border border-border text-xs shrink-0">
                    {session.spot_number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PlateCard plate={session.vehicle_plate} size="sm" />
                      <span className={`chip ${session.session_type === 'resident_excess' ? 'chip-warning' : 'chip-success'}`}>
                        {session.session_type === 'resident_excess' ? 'Resident Overflow' : 'Authorized Visitor'}
                      </span>
                    </div>
                    <div className="text-xs text-ink-secondary mt-1.5 font-medium">
                      Registered by <strong className="text-ink">{session.unit_number}</strong>
                      {session.visitor_name && (
                        <span className="ml-2">
                          · Visitor <strong className="text-ink">{session.visitor_name}</strong>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-tertiary mt-0.5">
                      {fmtTimeRange(session.start_time, session.expected_end_time)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="pt-2 border-t border-border">
                <CountdownTimer
                  startTime={session.start_time}
                  expectedEndTime={session.expected_end_time}
                  compact
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty state hint */}
      {!searchQuery && activeSessions.length === 0 && (
        <div className="card p-6 text-center">
          <Car className="w-10 h-10 text-ink-tertiary mx-auto mb-2 opacity-50" />
          <span className="text-sm font-bold text-ink block">No active sessions</span>
          <p className="text-xs text-ink-tertiary mt-1">There are no active parking sessions to verify right now.</p>
        </div>
      )}
    </div>
  );
};
