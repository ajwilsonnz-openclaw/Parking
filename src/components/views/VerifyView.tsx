'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Search, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { CountdownTimer } from '@/components/parking/CountdownTimer';

export const VerifyView: React.FC = () => {
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
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto pb-12">
      {/* Verify Header Card */}
      <div className="app-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052b4] flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
              VEHICLE VERIFICATION
            </h2>
            <p className="text-xs text-slate-400">Search spot or plate for authorization status</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">ACTIVE</span>
          <span className="text-base font-black text-blue-600">{activeSessions.length} Vehicles</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="app-card p-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spot (e.g. V-03) or plate (e.g. GHJ125)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {matchingSessions.length === 0 ? (
          <div className="app-card p-6 text-center border-rose-200 bg-rose-50/20">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-extrabold uppercase text-rose-700">UNVERIFIED VEHICLE</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No active parking session found for &quot;{query}&quot;. Vehicle may be unauthorized.
            </p>
          </div>
        ) : (
          matchingSessions.map((session) => (
            <div key={session.id} className="app-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-3 py-1 rounded-xl bg-slate-100 font-mono font-black text-slate-900 border border-slate-200 text-xs shrink-0">
                  {session.spot_number}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <PlateCard plate={session.vehicle_plate} size="sm" />
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        session.session_type === 'resident_excess'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {session.session_type === 'resident_excess' ? 'Resident Overflow' : 'Authorized Visitor'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5 font-medium">
                    Registered by: <strong className="text-slate-800">{session.unit_number}</strong>
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
