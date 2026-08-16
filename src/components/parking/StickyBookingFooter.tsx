'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  User,
  Plus,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';
import { Carpark, UnitVehicle, SavedGuest } from '@/types';

interface StickyBookingFooterProps {
  selectedSpot: Carpark | null;
  vehicles: UnitVehicle[];
  savedGuests?: SavedGuest[];
  onClearSelection: () => void;
  onConfirmBooking: (params: {
    spot: Carpark;
    plateNumber: string;
    durationHours: number;
    visitorName?: string;
    savedGuestId?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

type CarSourceMode = 'saved' | 'new' | 'resident';

export const StickyBookingFooter: React.FC<StickyBookingFooterProps> = ({
  selectedSpot,
  vehicles,
  savedGuests = [],
  onClearSelection,
  onConfirmBooking,
  isSubmitting,
}) => {
  // Mode selection: default to 'saved' if saved guests exist, else 'new'
  const [carMode, setCarMode] = useState<CarSourceMode>(() =>
    savedGuests.length > 0 ? 'saved' : 'new'
  );

  // Selected saved guest
  const [selectedGuestId, setSelectedGuestId] = useState<string>(
    savedGuests.length > 0 ? savedGuests[0].id : ''
  );

  // New guest inputs
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newPlate, setNewPlate] = useState('');

  // Resident vehicle selection
  const [selectedResidentPlate, setSelectedResidentPlate] = useState<string>(() => {
    const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
    return primary ? primary.plate_number : '';
  });

  // End time presets & custom picker
  // Calculate dynamic target times from current clock
  const timePresets = useMemo(() => {
    const now = new Date();
    const presets: { label: string; hoursFromNow: number; timeStr: string }[] = [];

    // Helper to calculate hours delta
    const getHoursDelta = (targetHours: number, targetMinutes: number, addDays: number = 0) => {
      const target = new Date(now);
      target.setDate(target.getDate() + addDays);
      target.setHours(targetHours, targetMinutes, 0, 0);
      const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
      return Math.max(0.5, Math.min(24, Math.round(diffHours * 10) / 10));
    };

    // Afternoon / Evening checkpoints
    const currentHour = now.getHours();

    if (currentHour < 12) {
      presets.push({ label: '1:00 PM', hoursFromNow: getHoursDelta(13, 0), timeStr: '1:00 PM' });
    }
    if (currentHour < 15) {
      presets.push({ label: '3:30 PM', hoursFromNow: getHoursDelta(15, 30), timeStr: '3:30 PM' });
    }
    if (currentHour < 18) {
      presets.push({ label: '6:00 PM', hoursFromNow: getHoursDelta(18, 0), timeStr: '6:00 PM' });
    }
    if (currentHour < 21) {
      presets.push({ label: '9:00 PM', hoursFromNow: getHoursDelta(21, 0), timeStr: '9:00 PM' });
    }
    // Midnight
    presets.push({ label: 'Midnight', hoursFromNow: getHoursDelta(23, 59), timeStr: '11:59 PM' });
    // Tomorrow morning (8:00 AM)
    presets.push({ label: 'Tmrw 8 AM', hoursFromNow: getHoursDelta(8, 0, 1), timeStr: 'Tomorrow 8:00 AM' });

    // Fallback if late night: 2h, 4h, 8h, 24h
    if (presets.length < 3) {
      return [
        { label: '2 Hours', hoursFromNow: 2, timeStr: '2 Hours' },
        { label: '4 Hours', hoursFromNow: 4, timeStr: '4 Hours' },
        { label: '8 Hours', hoursFromNow: 8, timeStr: '8 Hours' },
        { label: '24 Hours', hoursFromNow: 24, timeStr: '24 Hours (Max)' },
      ];
    }

    return presets.slice(0, 4);
  }, []);

  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(() =>
    timePresets.length > 0 ? timePresets[0].hoursFromNow : 2
  );
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>(() =>
    timePresets.length > 0 ? timePresets[0].label : '2 Hours'
  );

  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!selectedSpot) return null;

  const rawNumber = selectedSpot.spot_number.replace('-', '').toUpperCase();
  const spotDisplayName = rawNumber.startsWith('V')
    ? `Visitor ${rawNumber.replace(/^V0*/, '')}`
    : `Visitor ${rawNumber}`;

  // Resolve active car info
  let activePlate = '';
  let activeVisitorName = '';
  let activeGuestId: string | undefined = undefined;

  if (carMode === 'saved') {
    const guest = savedGuests.find((g) => g.id === selectedGuestId) || savedGuests[0];
    if (guest) {
      activePlate = guest.plate;
      activeVisitorName = guest.name;
      activeGuestId = guest.id;
    }
  } else if (carMode === 'new') {
    activePlate = newPlate.trim().toUpperCase();
    activeVisitorName = newVisitorName.trim();
  } else {
    activePlate = selectedResidentPlate.trim().toUpperCase();
    activeVisitorName = 'Resident Vehicle';
  }

  const handleStartParking = async () => {
    if (!activePlate) return;
    try {
      await onConfirmBooking({
        spot: selectedSpot,
        plateNumber: activePlate,
        durationHours: selectedDurationHours,
        visitorName: activeVisitorName || undefined,
        savedGuestId: activeGuestId,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClearSelection();
      }, 1400);
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <div className="fixed bottom-14 inset-x-0 z-40 max-w-lg mx-auto p-3 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="card p-4 bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-3xl pointer-events-auto space-y-3.5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-md shadow-emerald-600/30">
              {rawNumber}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 leading-tight">
                  {spotDisplayName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {selectedSpot.section || 'Complex'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Visitor Parking Stall
              </p>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Car Selection Segment Tabs */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Select Vehicle
            </span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {savedGuests.length > 0 && (
              <button
                type="button"
                onClick={() => setCarMode('saved')}
                className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  carMode === 'saved'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Saved Visitor</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCarMode('new')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                carMode === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              } ${savedGuests.length === 0 ? 'col-span-2' : ''}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Visitor</span>
            </button>

            <button
              type="button"
              onClick={() => setCarMode('resident')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                carMode === 'resident'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>My Car</span>
            </button>
          </div>

          {/* Mode Details Form */}
          {carMode === 'saved' && savedGuests.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {savedGuests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => setSelectedGuestId(guest.id)}
                  className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all ${
                    selectedGuestId === guest.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-extrabold">{guest.name}</div>
                  <div className="font-mono text-[10px] text-slate-500">{guest.plate}</div>
                </button>
              ))}
            </div>
          )}

          {carMode === 'new' && (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Visitor Name
                </label>
                <input
                  type="text"
                  value={newVisitorName}
                  onChange={(e) => setNewVisitorName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="input w-full py-1.5 px-2.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  License Plate
                </label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="input w-full py-1.5 px-2.5 text-xs font-mono font-bold uppercase text-slate-900"
                  autoFocus
                />
              </div>
            </div>
          )}

          {carMode === 'resident' && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedResidentPlate(v.plate_number)}
                  className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all ${
                    selectedResidentPlate === v.plate_number
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-extrabold">{v.make_model_color || 'Resident Car'}</div>
                  <div className="font-mono text-[10px] text-slate-500">{v.plate_number}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* End Time Selection (Booking to a specific time e.g. 6:00 PM) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Book Until
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700">
              {selectedPresetLabel}
            </span>
          </div>

          {/* Time Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {timePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSelectedDurationHours(preset.hoursFromNow);
                  setSelectedPresetLabel(preset.label);
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  selectedPresetLabel === preset.label
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleStartParking}
          disabled={isSubmitting || !activePlate || bookingSuccess}
          className={`w-full py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
            bookingSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-600/30'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span>Confirming Reservation...</span>
          ) : bookingSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Reserved Successfully!</span>
            </>
          ) : (
            <>
              <span>
                Confirm {rawNumber} (Until {selectedPresetLabel})
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
