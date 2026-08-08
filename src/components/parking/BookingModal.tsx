'use client';

import React, { useState } from 'react';
import { Carpark, SessionType } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { X, Car, Clock, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  spot: Carpark | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ spot, onClose }) => {
  const { bookSpot, currentUser, vehicles, config } = useApp();

  const [sessionType, setSessionType] = useState<SessionType>('visitor');
  const [selectedPlate, setSelectedPlate] = useState<string>(
    vehicles[0]?.plate_number || 'GHJ125'
  );
  const [customPlate, setCustomPlate] = useState<string>('');
  const [useCustomPlate, setUseCustomPlate] = useState<boolean>(false);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorPhone, setVisitorPhone] = useState<string>('');

  if (!spot) return null;

  const maxHours = sessionType === 'visitor' ? config.max_visitor_hours : config.max_resident_excess_hours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlate = useCustomPlate ? customPlate.trim().toUpperCase() : selectedPlate;

    if (!finalPlate) {
      alert('Please enter or select a valid vehicle registration plate.');
      return;
    }

    bookSpot(spot.id, spot.spot_number, finalPlate, durationHours, sessionType, visitorName, visitorPhone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-mono font-extrabold text-xl">
            {spot.spot_number}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Reserve Parking Spot</h3>
            <p className="text-xs text-slate-400">{spot.section} • Millennium Village Complex</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Session Type Switcher */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Parking Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSessionType('visitor');
                  setDurationHours(Math.min(durationHours, config.max_visitor_hours));
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  sessionType === 'visitor'
                    ? 'bg-sky-600/20 border-sky-500 text-white shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Car className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold">Visitor Session</div>
                  <div className="text-[11px] opacity-80 mt-0.5">For guest/contractor cars (Max {config.max_visitor_hours}h)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSessionType('resident_excess');
                  setDurationHours(Math.min(durationHours, config.max_resident_excess_hours));
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  sessionType === 'resident_excess'
                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-glow-amber'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserCheck className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold">Resident Excess</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Subject to Priority Vacate Rule #8</div>
                </div>
              </button>
            </div>
          </div>

          {/* Vehicle License Plate Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Vehicle Registration Plate
              </label>
              <button
                type="button"
                onClick={() => setUseCustomPlate(!useCustomPlate)}
                className="text-xs text-sky-400 hover:underline"
              >
                {useCustomPlate ? 'Choose Registered Vehicle' : '+ Enter Custom Rego Plate'}
              </button>
            </div>

            {useCustomPlate ? (
              <input
                type="text"
                value={customPlate}
                onChange={(e) => setCustomPlate(e.target.value)}
                placeholder="e.g. GHJ125 or KXM890"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-sky-500"
              />
            ) : (
              <select
                value={selectedPlate}
                onChange={(e) => setSelectedPlate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-sky-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plate_number}>
                    {v.plate_number} — {v.make_model_color} ({v.unit_number})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional Visitor Details */}
          {sessionType === 'visitor' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Visitor Name (Optional)
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Mark Taylor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Visitor Phone (Optional)
                </label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Duration Selector Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Booking Duration
              </label>
              <span className="text-sm font-mono font-bold text-sky-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {durationHours} Hours (Max {maxHours}h)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={maxHours}
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1 Hour</span>
              <span>12 Hours</span>
              <span>{maxHours} Hours</span>
            </div>
          </div>

          {sessionType === 'resident_excess' && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Note on Rule #8:</strong> If visitor carparks reach 0 available, resident excess vehicles are flagged to vacate for incoming guests.
              </span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all active:scale-[0.98]"
            >
              Confirm Carpark Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
