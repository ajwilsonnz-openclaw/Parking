'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { X, Search, ShieldCheck, ShieldAlert, Eye, Car } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { CountdownTimer } from './CountdownTimer';

interface PhysicalLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicalLookupModal: React.FC<PhysicalLookupModalProps> = ({ isOpen, onClose }) => {
  const { sessions, carparks } = useApp();
  const [query, setQuery] = useState<string>('');

  if (!isOpen) return null;

  const searchQuery = query.trim().toLowerCase();

  const matchingSessions = searchQuery
    ? sessions.filter(
        (s) =>
          s.is_active &&
          (s.spot_number.toLowerCase().includes(searchQuery) ||
            s.vehicle_plate.toLowerCase().includes(searchQuery) ||
            s.unit_number.toLowerCase().includes(searchQuery))
      )
    : sessions.filter((s) => s.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Physical Spot & Plate Verification</h3>
            <p className="text-xs text-slate-400">
              Verify if a parked vehicle is authorized while protecting resident privacy
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type spot number (e.g. V-03) or rego plate (e.g. GHJ125)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Search Results List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {matchingSessions.length === 0 ? (
            <div className="py-8 text-center bg-rose-950/20 border border-rose-500/30 rounded-xl p-4">
              <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-rose-300">Unverified Vehicle / Spot</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No active session found matching &quot;{query}&quot;. If parked in a visitor spot, this vehicle may be in violation.
              </p>
            </div>
          ) : (
            matchingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800 font-mono font-extrabold text-white border border-slate-700 text-sm">
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

                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-3">
                      <span>Registered by: <strong className="text-white">{session.unit_number}</strong></span>
                      {session.visitor_name && (
                        <span>Guest: <strong className="text-slate-300">{session.visitor_name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
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
    </div>
  );
};
