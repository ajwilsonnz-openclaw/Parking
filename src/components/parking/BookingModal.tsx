'use client';

import React, { useState, useMemo } from 'react';
import { Carpark, SessionType } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Car, UserCheck, AlertCircle, Plus, Users, ChevronDown } from 'lucide-react';

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
  const { bookSpot, currentUser, vehicles, config, addSavedGuest, savedGuests } = useApp();

  const [sessionType, setSessionType] = useState<SessionType>('visitor');
  const [durationHours, setDurationHours] = useState<number>(4);

  // Visitor session: custom plate entry
  const [guestPlate, setGuestPlate] = useState<string>(initialPlate || '');
  const [visitorName, setVisitorName] = useState<string>(initialVisitorName || '');
  const [visitorPhone, setVisitorPhone] = useState<string>(initialVisitorPhone || '');
  const [saveAsRegular, setSaveAsRegular] = useState<boolean>(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Resident excess: choose from own registered vehicles only
  const unitVehicles = useMemo(
    () => vehicles.filter((v) => v.unit_number === currentUser?.unit_number),
    [vehicles, currentUser]
  );
  const [selectedResidentPlate, setSelectedResidentPlate] = useState<string>(
    unitVehicles[0]?.plate_number || ''
  );

  if (!spot) return null;

  const maxHours = sessionType === 'visitor' ? config.max_visitor_hours : config.max_resident_excess_hours;
  const finalPlate = (sessionType === 'visitor' ? guestPlate : selectedResidentPlate || '').trim().toUpperCase();

  const fillFromSavedGuest = (guestId: string) => {
    const g = savedGuests.find((x) => x.id === guestId);
    if (!g) return;
    setGuestPlate(g.plate);
    setVisitorName(g.name);
    setVisitorPhone(g.phone || '');
    setShowGuestPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalPlate) return;

    bookSpot(
      spot.id,
      spot.spot_number,
      finalPlate,
      durationHours,
      sessionType,
      sessionType === 'visitor' ? visitorName : undefined,
      sessionType === 'visitor' ? visitorPhone : undefined
    );

    if (sessionType === 'visitor' && saveAsRegular && visitorName.trim() && guestPlate.trim()) {
      addSavedGuest({
        name: visitorName.trim(),
        plate: finalPlate,
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
          {spot.spot_number.replace('V-', 'V')}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-ink tracking-tight">Reserve car park</h3>
          <p className="text-xs text-ink-secondary">{config.complex_name}</p>
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
              onClick={() => { setSessionType('resident_excess'); setDurationHours(Math.min(durationHours, config.max_resident_excess_hours)); if (!selectedResidentPlate && unitVehicles[0]) setSelectedResidentPlate(unitVehicles[0].plate_number); }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                sessionType === 'resident_excess'
                  ? 'bg-warning-soft border-warning text-ink'
                  : 'border-border text-ink-secondary hover:border-warning/40'
              }`}
            >
              <UserCheck className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Resident excess</div>
                <div className="text-[11px] text-ink-secondary mt-0.5">Your second vehicle</div>
              </div>
            </button>
          </div>
        </div>

        {/* Plate picker - different per session type */}
        {sessionType === 'visitor' ? (
          <div className="space-y-3">
            {/* Saved guests - mobile-friendly, big touch targets */}
            {savedGuests.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGuestPicker(!showGuestPicker)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-bg-surface text-left text-sm font-bold text-ink hover:border-accent/40 transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-accent" />
                    {guestPlate && savedGuests.find((g) => g.plate.toUpperCase() === guestPlate.toUpperCase())
                      ? `Saved: ${savedGuests.find((g) => g.plate.toUpperCase() === guestPlate.toUpperCase())!.name}`
                      : 'Choose from saved guests'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-ink-tertiary transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} />
                </button>

                {showGuestPicker && (
                  <div className="mt-2 card overflow-hidden">
                    {savedGuests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => fillFromSavedGuest(g.id)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-bg border-b border-border last:border-b-0 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-ink">{g.name}</div>
                          {g.make_model_color && (
                            <div className="text-[11px] text-ink-tertiary">{g.make_model_color}</div>
                          )}
                        </div>
                        <span className="font-mono text-xs font-black text-ink bg-bg-surface px-2.5 py-1 rounded-lg border border-border">
                          {g.plate}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom plate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                  {showGuestPicker && savedGuests.length ? 'Or enter plate manually' : 'Vehicle registration'}
                </label>
              </div>
              <input
                type="text"
                value={guestPlate}
                onChange={(e) => setGuestPlate(e.target.value.toUpperCase())}
                placeholder="e.g. GHJ125"
                className="input font-mono uppercase tracking-wider text-center text-base font-black"
                maxLength={6}
                autoComplete="off"
                style={{ letterSpacing: '0.1em' }}
              />
            </div>

            {/* Visitor details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">Visitor name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Mark Taylor"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-ink-tertiary mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Save as regular visitor */}
            {visitorName.trim() && guestPlate.trim() && (
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
        ) : (
          // Resident excess - choose from own registered vehicles only
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
              Your vehicle
            </label>
            {unitVehicles.length === 0 ? (
              <div className="card p-4 text-xs text-ink-tertiary text-center">
                No vehicles registered to {currentUser?.unit_number}. Add one in the Account tab first.
              </div>
            ) : (
              <div className="space-y-2">
                {unitVehicles.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setSelectedResidentPlate(v.plate_number)}
                    className={`w-full card p-3.5 flex items-center justify-between gap-3 text-left transition-all ${
                      selectedResidentPlate === v.plate_number ? 'border-accent ring-1 ring-accent/30' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink">{v.make_model_color}</div>
                      <div className="text-[11px] text-ink-tertiary">{v.plate_number}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedResidentPlate === v.plate_number ? 'border-accent bg-accent/10' : 'border-border'
                    }`}>
                      {selectedResidentPlate === v.plate_number && <div className="w-3 h-3 rounded-full bg-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="card p-3.5 bg-warning-soft text-xs text-ink-secondary flex items-start gap-2 mt-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
              <span>
                <strong className="text-warning">Rule reminder:</strong> If visitor parks reach 0 available, resident excess vehicles are asked to vacate.
              </span>
            </div>
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

        <button type="submit" className="btn-primary w-full" disabled={!finalPlate}>
          Confirm booking
        </button>
      </form>
    </Modal>
  );
};
