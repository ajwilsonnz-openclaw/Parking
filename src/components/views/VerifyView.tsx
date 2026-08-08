'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Search, Eye, ShieldCheck, ShieldAlert, Car, Clock } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { CountdownTimer } from '@/components/parking/CountdownTimer';

export const VerifyView: React.FC = () => {
  const { sessions, carparks } = useApp();
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
    <div className="space-y-6 animate-fade-in">
      {/* Verify Page Banner */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-sky-500">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Physical Car Park Inspection</h2>
            <p className="text-xs text-slate-400">Verify parked vehicles on site while preserving resident privacy</p>
          </div>
        </div>

        <div className="glass-panel px-4 py-2 text-center shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Bookings</span>
          <span className="text-lg font-extrabold text-sky-400">{activeSessions.length} Vehicles</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by spot number (e.g. V-03) or rego plate (e.g. GHJ125)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Inspection Results List */}
      <div className="space-y-3">
        {matchingSessions.length === 0 ? (
          <div className="py-12 text-center glass-panel p-6 border-rose-500/30">
            <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-rose-300">Unverified Vehicle / Spot</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No active session found matching &quot;{query}&quot;. If parked in a visitor space, this vehicle may be unauthorized.
            </p>
          </div>
        ) : (
          matchingSessions.map((session) => (
            <div
              key={session.id}
              className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 font-mono font-extrabold text-white border border-slate-700 text-sm shrink-0">
                  {session.spot_number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <PlateCard plate={session.vehicle_plate} size="sm" />
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        session.session_type === 'resident_excess'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {session.session_type === 'resident_excess' ? 'Resident Excess' : 'Authorized Visitor'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-3">
                    <span>Unit: <strong className="text-white">{session.unit_number}</strong></span>
                    {session.visitor_name && (
                      <span>Guest: <strong className="text-slate-300">{session.visitor_name}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0">
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
    </div>
  );
};
