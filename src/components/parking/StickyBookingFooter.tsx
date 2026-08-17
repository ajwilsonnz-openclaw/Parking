'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Carpark, Vehicle, SavedGuest } from '@/types';
import { TactileTimePicker } from './TactileTimePicker';
import { Users, Plus, Car, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface StickyBookingFooterProps {
  selectedSpot: Carpark | null;
  vehicles: Vehicle[];
  savedGuests: SavedGuest[];
  onClearSelection: () => void;
  onConfirmBooking: (params: {
    spot: Carpark;
    plateNumber: string;
    durationHours: number;
    visitorName?: string;
    savedGuestId?: string;
    saveForFuture?: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const StickyBookingFooter: React.FC<StickyBookingFooterProps> = ({
  selectedSpot,
  vehicles,
  savedGuests,
  onClearSelection,
  onConfirmBooking,
  isSubmitting = false,
}) => {
  // Car Selection Mode: 'saved' | 'new' | 'resident'
  const [carMode, setCarMode] = useState<'saved' | 'new' | 'resident'>('saved');

  // Input states
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [newPlate, setNewPlate] = useState<string>('');
  const [newVisitorName, setNewVisitorName] = useState<string>('');
  const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
  const [selectedResidentPlate, setSelectedResidentPlate] = useState<string>('');

  // Time & Duration state
  const [durationHours, setDurationHours] = useState<number>(1);
  const [selectedTimeLabel, setSelectedTimeLabel] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Initialize selections when selectedSpot or savedGuests changes
  useEffect(() => {
    if (savedGuests && savedGuests.length > 0) {
      setCarMode('saved');
      setSelectedGuestId(savedGuests[0].id);
    } else {
      setCarMode('new');
    }

    if (vehicles && vehicles.length > 0) {
      setSelectedResidentPlate(vehicles[0].plate_number);
    }
  }, [savedGuests, vehicles, selectedSpot]);

  if (!selectedSpot) return null;

  const rawNumber = (selectedSpot?.spot_number || '').replace(/^V-?/i, '').padStart(2, '0');
  const spotDisplayName = `Visitor ${parseInt(rawNumber, 10)}`;

  // Determine active plate to submit
  let activePlate = '';
  let activeVisitorName = '';
  let activeGuestId: string | undefined;

  if (carMode === 'saved') {
    const found = savedGuests.find((g) => g.id === selectedGuestId);
    if (found) {
      activePlate = found.plate;
      activeVisitorName = found.name;
      activeGuestId = found.id;
    }
  } else if (carMode === 'new') {
    activePlate = newPlate.trim().toUpperCase();
    activeVisitorName = newVisitorName.trim();
  } else if (carMode === 'resident') {
    activePlate = selectedResidentPlate;
    activeVisitorName = 'Resident Vehicle';
  }

  const handleTimeChange = (params: {
    hoursFromNow: number;
    formattedTime: string;
    targetDate: Date;
  }) => {
    setDurationHours(params.hoursFromNow);
    setSelectedTimeLabel(params.formattedTime);
  };

  const handleStartParking = async () => {
    if (!activePlate) {
      alert('Please enter or select a vehicle license plate.');
      return;
    }

    try {
      await onConfirmBooking({
        spot: selectedSpot,
        plateNumber: activePlate,
        durationHours,
        visitorName: activeVisitorName,
        savedGuestId: activeGuestId,
        saveForFuture: carMode === 'new' ? saveForFuture : false,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClearSelection();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to complete booking');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 max-w-lg mx-auto px-3 pointer-events-none select-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="p-4 backdrop-blur-2xl rounded-3xl pointer-events-auto space-y-3.5 text-slate-100 border transition-all"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 8px 36px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl text-slate-950 flex items-center justify-center font-mono font-black text-xs"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 0 12px var(--ambient-glow)',
              }}
            >
              V{rawNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white leading-tight">
                  {spotDisplayName}
                </span>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--accent-secondary)',
                  }}
                >
                  {selectedSpot.section || 'Complex'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-full hover:text-white transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Car Selection Segment Tabs */}
        <div
          className="space-y-2 pt-1 border-t"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Select Vehicle
            </span>
          </div>

          {/* Mode Switcher Pills */}
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: 'var(--card-border)',
            }}
          >
            {savedGuests.length > 0 && (
              <button
                type="button"
                onClick={() => setCarMode('saved')}
                className="py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
                style={{
                  background: carMode === 'saved' ? 'var(--accent-gradient)' : 'transparent',
                  color: carMode === 'saved' ? '#020617' : 'var(--text-muted)',
                  boxShadow: carMode === 'saved' ? '0 0 12px var(--ambient-glow)' : 'none',
                }}
              >
                <Users className="w-3 h-3" />
                <span>Saved ({savedGuests.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCarMode('new')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                savedGuests.length === 0 ? 'col-span-2' : ''
              }`}
              style={{
                background: carMode === 'new' ? 'var(--accent-gradient)' : 'transparent',
                color: carMode === 'new' ? '#020617' : 'var(--text-muted)',
                boxShadow: carMode === 'new' ? '0 0 12px var(--ambient-glow)' : 'none',
              }}
            >
              <Plus className="w-3 h-3" />
              <span>New Visitor</span>
            </button>

            <button
              type="button"
              onClick={() => setCarMode('resident')}
              className="py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
              style={{
                background: carMode === 'resident' ? 'var(--accent-gradient)' : 'transparent',
                color: carMode === 'resident' ? '#020617' : 'var(--text-muted)',
                boxShadow: carMode === 'resident' ? '0 0 12px var(--ambient-glow)' : 'none',
              }}
            >
              <Car className="w-3 h-3" />
              <span>My Car</span>
            </button>
          </div>

          {/* Mode Details Form */}
          {carMode === 'saved' && savedGuests.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {savedGuests.map((guest) => {
                const isSelected = selectedGuestId === guest.id;
                return (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => setSelectedGuestId(guest.id)}
                    className="px-3 py-1.5 rounded-xl text-left border shrink-0 transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                      borderColor: isSelected ? 'var(--accent-secondary)' : 'var(--card-border)',
                      boxShadow: isSelected ? '0 0 10px var(--ambient-glow)' : 'none',
                    }}
                  >
                    <div className="text-xs font-extrabold text-white">{guest.name}</div>
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      {guest.plate}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {carMode === 'new' && (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="text-[10px] font-bold block mb-0.5"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    License Plate <span className="text-rose-400 font-extrabold">* Required</span>
                  </label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123"
                    className="w-full py-1.5 px-2.5 text-xs font-mono font-bold uppercase text-white rounded-xl focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      border: '1px solid var(--card-border)',
                    }}
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    className="text-[10px] font-bold block mb-0.5"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    Visitor Name <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full py-1.5 px-2.5 text-xs text-white rounded-xl focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      border: '1px solid var(--card-border)',
                    }}
                  />
                </div>
              </div>

              {/* Save for Future Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="rounded bg-black/40 w-3.5 h-3.5"
                  style={{
                    accentColor: 'var(--accent-primary)',
                    borderColor: 'var(--card-border)',
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Save this visitor vehicle for future bookings
                </span>
              </label>
            </div>
          )}

          {carMode === 'resident' && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {vehicles.map((v) => {
                const isSelected = selectedResidentPlate === v.plate_number;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedResidentPlate(v.plate_number)}
                    className="px-3 py-1.5 rounded-xl text-left border shrink-0 transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                      borderColor: isSelected ? 'var(--accent-secondary)' : 'var(--card-border)',
                      boxShadow: isSelected ? '0 0 10px var(--ambient-glow)' : 'none',
                    }}
                  >
                    <div className="text-xs font-extrabold text-white">{v.make_model_color || 'Resident Car'}</div>
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      {v.plate_number}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tactile Time Stepper Picker */}
        <div
          className="pt-1 border-t"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <TactileTimePicker onTimeChange={handleTimeChange} />
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleStartParking}
          disabled={isSubmitting || !activePlate || bookingSuccess}
          className="w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-slate-950"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 25px var(--ambient-glow)',
          }}
        >
          {isSubmitting ? (
            <span>Confirming Reservation...</span>
          ) : bookingSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Reserved Successfully!</span>
            </>
          ) : (
            <>
              <span>
                Confirm V{rawNumber} (Until {selectedTimeLabel || 'Selected Time'})
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
