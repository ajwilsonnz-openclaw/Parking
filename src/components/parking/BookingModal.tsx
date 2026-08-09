'use client';

import React, { useState } from 'react';
import { Carpark, SessionType } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { X, Car, Clock, ShieldCheck, UserCheck, AlertCircle, Users } from 'lucide-react';

interface BookingModalProps {
  spot: Carpark | null;
  isOpen: boolean;
  onClose: () => void;
  initialPlate?: string;
  initialVisitorName?: string;
  initialVisitorPhone?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  spot,
  isOpen,
  onClose,
  initialPlate,
  initialVisitorName,
  initialVisitorPhone,
}) => {
  const { bookSpot, currentUser, vehicles, config, addSavedGuest } = useApp();

  const [sessionType, setSessionType] = useState<SessionType>('visitor');
  const [selectedPlate, setSelectedPlate] = useState<string>(initialPlate || vehicles[0]?.plate_number || 'GHJ125');
  const [customPlate, setCustomPlate] = useState<string>('');
  const [useCustomPlate, setUseCustomPlate] = useState<boolean>(!!initialPlate);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [visitorName, setVisitorName] = useState<string>(initialVisitorName || '');
  const [visitorPhone, setVisitorPhone] = useState<string>(initialVisitorPhone || '');
  const [saveAsRegular, setSaveAsRegular] = useState<boolean>(false);

  if (!spot) return null;

  const maxHours = sessionType === 'visitor' ? config.max_visitor_hours : config.max_resident_excess_hours;
  const effectivePlate = useCustomPlate ? customPlate.trim().toUpperCase() : selectedPlate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectivePlate) {
      alert('Please enter or select a valid vehicle registration plate.');
      return;
    }

    bookSpot(spot.id, spot.spot_number, effectivePlate, durationHours, sessionType, visitorName, visitorPhone);

    // Persist as regular guest if ticked
    if (sessionType === 'visitor' && saveAsRegular && visitorName.trim()) {
      addSavedGuest({
        name: visitorName.trim(),
        plate: effectivePlate,
        phone: visitorPhone || undefined,
        make_model_color: undefined,
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center text-base font-black shrink-0">
          {spot.spot_number}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-ink tracking-tight">Reserve car park</h3>
          <p className="text-xs text-ink-secondary">{spot.section} • Millennium Village</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Session type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
            Parking type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setSessionType('visitor'); setDurationHours(Math.min(durationHours, config.max_visitor_hours)); }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                sessionType === 'visitor'
                  ? 'bg-accent-soft border-accent text-ink shadow-glow-accent'
                  : 'border-border text-ink-secondary hover:border-accent/40'
              }`}
            >
              <Car className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Visitor session</div>
                <div className="text-[11px] text-ink-secondary mt-0.5">Max {config.max_visitor_hours}h for guests & contractors</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSessionType('resident_excess'); setDurationHours(Math.min(durationHours, config.max_resident_excess_hours)); }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                sessionType === 'resident_excess'
                  ? 'bg-warning-soft border-warning text-ink'
                  : 'border-border text-ink-secondary hover:border-warning/40'
              }`}
            >
              <UserCheck className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Resident excess</div>
                <div className="text-[11px] text-ink-secondary mt-0.5">Subject to priority-vacate rule</div>
              </div>
            </button>
          </div>
        </div>

        {/* Plate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Vehicle registration
            </label>
            <button
              type="button"
              onClick={() => setUseCustomPlate(!useCustomPlate)}
              className="text-xs text-accent hover:underline font-semibold"
            >
              {useCustomPlate ? 'Choose from registered vehicles' : '+ Enter custom plate'}
            </button>
          </div>

          {useCustomPlate ? (
            <input
              type="text"
              value={customPlate}
              onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
              placeholder="e.g. GHJ125"
              className="input font-mono uppercase tracking-wider"
            />
          ) : (
            <select
              value={selectedPlate}
              onChange={(e) => setSelectedPlate(e.target.value)}
              className="input font-mono uppercase tracking-wider"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate_number}>
                  {v.plate_number} — {v.make_model_color}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Visitor details */}
        {sessionType === 'visitor' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">
                  Visitor name
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Mark Taylor"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">
                  Visitor phone
                </label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Save as regular visitor */}
            {visitorName.trim() && (
              <button
                type="button"
                onClick={() => setSaveAsRegular(!saveAsRegular)}
                className={`w-full card p-3.5 flex items-center gap-3 text-left transition-all ${
                  saveAsRegular ? 'border-accent ring-1 ring-accent/25' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  saveAsRegular ? 'border-accent bg-accent' : 'border-border'
                }`}>
                  {saveAsRegular && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">Save as regular visitor</div>
                  <div className="text-[11px] text-ink-secondary">Quick-book {visitorName.split(' ')[0]} next time with one tap</div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Booking duration
            </label>
            <span className="text-sm font-mono font-bold text-accent bg-accent-soft px-3 py-1 rounded-lg border border-accent-border">
              {durationHours} hrs (max {maxHours}h)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max={maxHours}
            value={durationHours}
            onChange={(e) => setDurationHours(parseInt(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-ink-tertiary mt-1">
            <span>1 hour</span>
            <span>{Math.floor(maxHours / 2)} hours</span>
            <span>{maxHours} hours</span>
          </div>
        </div>

        {sessionType === 'resident_excess' && (
          <div className="card p-3.5 border-l-4 border-l-warning bg-warning-soft text-xs text-ink-secondary flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
            <span>
              <strong className="text-warning">Rule reminder:</strong> If visitor parks reach 0 available, resident excess vehicles are asked to vacate.
            </span>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          Confirm booking
        </button>
      </form>
    </Modal>
  );
};
