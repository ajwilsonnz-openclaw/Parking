'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Carpark, SessionType } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Car, AlertCircle, Clock, MapPin } from 'lucide-react';

interface BookingModalProps {
  spot?: Carpark | null;
  isOpen: boolean;
  onClose: () => void;
  initialPlate?: string;
  initialVisitorName?: string;
  initialVisitorPhone?: string;
}

const formatDurationLabel = (hrs: number): string => {
  if (hrs === 0.25) return '15 mins';
  if (hrs === 0.5) return '30 mins';
  if (hrs === 0.75) return '45 mins';
  if (hrs === 1) return '1 hour';
  if (hrs === 1.5) return '1h 30m';
  if (hrs % 1 === 0) return `${hrs} hrs`;
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return `${h}h ${m}m`;
};

const DURATION_PRESETS = [0.25, 0.5, 0.75, 1, 2, 4, 8, 12, 24];

export const BookingModal: React.FC<BookingModalProps> = ({
  spot,
  isOpen,
  onClose,
  initialPlate,
  initialVisitorName,
  initialVisitorPhone,
}) => {
  const { bookSpot, currentUser, vehicles, config, addSavedGuest, savedGuests, carparks } = useApp();

  const availableCarparks = useMemo(
    () => carparks.filter((c) => c.status === 'available' || c.id === spot?.id),
    [carparks, spot]
  );

  const defaultSpot: Carpark = useMemo(() => ({
    id: 'v01',
    spot_number: 'V01',
    section: 'Ground Floor',
    status: 'available',
    is_visitor: true,
  }), []);

  const activeSpot = spot || availableCarparks[0] || carparks[0] || defaultSpot;

  const [selectedSpotId, setSelectedSpotId] = useState<string>(activeSpot.id);
  const [sessionType, setSessionType] = useState<SessionType>('visitor');
  const [durationHours, setDurationHours] = useState<number>(4);

  // Visitor session details
  const [guestPlate, setGuestPlate] = useState<string>(initialPlate || '');
  const [visitorName, setVisitorName] = useState<string>(initialVisitorName || '');
  const [visitorPhone, setVisitorPhone] = useState<string>(initialVisitorPhone || '');
  const [saveAsRegular, setSaveAsRegular] = useState<boolean>(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Sync initial props whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialPlate) setGuestPlate(initialPlate);
      if (initialVisitorName) setVisitorName(initialVisitorName);
      if (initialVisitorPhone) setVisitorPhone(initialVisitorPhone);
      if (spot?.id) setSelectedSpotId(spot.id);
      else if (availableCarparks.length > 0) setSelectedSpotId(availableCarparks[0].id);
    }
  }, [isOpen, initialPlate, initialVisitorName, initialVisitorPhone, spot, availableCarparks]);

  // Resident excess: choose from own registered vehicles only
  const unitVehicles = useMemo(
    () => vehicles.filter((v) => v.unit_number === currentUser?.unit_number),
    [vehicles, currentUser]
  );
  const [selectedResidentPlate, setSelectedResidentPlate] = useState<string>(
    unitVehicles[0]?.plate_number || ''
  );

  const currentSpotObj = carparks.find((c) => c.id === selectedSpotId) || activeSpot;
  const maxHours = Math.min(24, sessionType === 'visitor' ? (config.max_visitor_hours || 24) : (config.max_resident_excess_hours || 12));
  const finalPlate = (sessionType === 'visitor' ? guestPlate : selectedResidentPlate || '').trim().toUpperCase();

  const fillFromSavedGuest = (guestId: string) => {
    const g = savedGuests.find((x) => x.id === guestId);
    if (!g) return;
    setGuestPlate(g.plate);
    setVisitorName(g.name);
    setVisitorPhone(g.phone || '');
    setShowGuestPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalPlate || !currentSpotObj) return;

    await bookSpot(
      currentSpotObj.id,
      currentSpotObj.spot_number,
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
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center text-base font-black shrink-0 border border-accent-border font-mono">
          {currentSpotObj.spot_number.replace('V-', 'V')}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-ink tracking-tight">Reserve Car Park</h3>
          <p className="text-xs text-ink-secondary">{config.complex_name || 'Millennium Village'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Spot Selection Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            Choose Car Park Spot
          </label>
          <select
            value={selectedSpotId}
            onChange={(e) => setSelectedSpotId(e.target.value)}
            className="input text-sm font-bold w-full font-mono"
            required
          >
            {carparks.length === 0 ? (
              <option value="">No carparks available</option>
            ) : (
              carparks.map((c) => (
                <option key={c.id} value={c.id} disabled={c.status !== 'available' && c.id !== spot?.id}>
                  {c.spot_number.replace('V-', 'V')} — {c.status === 'available' || c.id === spot?.id ? 'Available' : 'Occupied'}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Parking type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-2">
            Parking type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setSessionType('visitor'); setDurationHours(Math.min(durationHours, 24)); }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                sessionType === 'visitor'
                  ? 'bg-accent-soft border-accent text-ink shadow-glow-accent'
                  : 'border-border text-ink-secondary hover:border-accent/40'
              }`}
            >
              <Car className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Visitor session</div>
                <div className="text-[11px] text-ink-secondary mt-0.5">Max 24h for guests &amp; contractors</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSessionType('resident_excess'); setDurationHours(Math.min(durationHours, config.max_resident_excess_hours || 12)); }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                sessionType === 'resident_excess'
                  ? 'bg-accent-soft border-accent text-ink shadow-glow-accent'
                  : 'border-border text-ink-secondary hover:border-accent/40'
              }`}
            >
              <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Resident excess</div>
                <div className="text-[11px] text-ink-secondary mt-0.5">Max {config.max_resident_excess_hours || 12}h for extra car</div>
              </div>
            </button>
          </div>
        </div>

        {sessionType === 'visitor' ? (
          <div className="space-y-4">
            {/* Quick pick saved guest */}
            {savedGuests.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGuestPicker(!showGuestPicker)}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1 mb-2"
                >
                  {showGuestPicker ? 'Hide saved visitors' : '⚡ Quick pick regular visitor'}
                </button>

                {showGuestPicker && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {savedGuests.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => fillFromSavedGuest(g.id)}
                        className="p-2.5 rounded-xl border border-border bg-bg-surface hover:border-accent/40 text-left transition-all"
                      >
                        <div className="text-xs font-bold text-ink truncate">{g.name}</div>
                        <div className="text-[10px] font-mono font-bold text-accent">{g.plate}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom plate */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-1.5">
                Vehicle registration
              </label>
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
                className={`w-full card p-3 flex items-center gap-3 text-left transition-all ${
                  saveAsRegular ? 'border-accent ring-1 ring-accent/25' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  saveAsRegular ? 'border-accent bg-accent' : 'border-border'
                }`}>
                  {saveAsRegular && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-ink">Save as regular visitor</div>
                  <div className="text-[10px] text-ink-secondary">Quick-book {visitorName.split(' ')[0]} next time with one tap</div>
                </div>
              </button>
            )}
          </div>
        ) : (
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
            <div className="card p-3 bg-warning-soft text-xs text-ink-secondary flex items-start gap-2 mt-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
              <span>
                <strong className="text-warning">Rule reminder:</strong> Resident excess parks max {config.max_resident_excess_hours || 12}h.
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
              {formatDurationLabel(durationHours)} (max {maxHours}h)
            </span>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {DURATION_PRESETS.filter((h) => h <= maxHours).map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => setDurationHours(hrs)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  durationHours === hrs
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {formatDurationLabel(hrs)}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="0.25"
            max={maxHours}
            step="0.25"
            value={durationHours}
            onChange={(e) => setDurationHours(parseFloat(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-ink-tertiary mt-1">
            <span>15 mins</span>
            <span>{Math.floor(maxHours / 2)} hours</span>
            <span>{maxHours} hours</span>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={!finalPlate || !currentSpotObj}>
          Confirm Booking ({currentSpotObj?.spot_number?.replace('V-', 'V')} • {formatDurationLabel(durationHours)})
        </button>
      </form>
    </Modal>
  );
};
