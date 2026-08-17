'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  User,
  Plus,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  Users
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
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
  const { addSavedGuest } = useApp();
  const timeInputRef = useRef<HTMLInputElement>(null);

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
  const [saveForFuture, setSaveForFuture] = useState(true);

  // Resident vehicle selection
  const [selectedResidentPlate, setSelectedResidentPlate] = useState<string>(() => {
    const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
    return primary ? primary.plate_number : '';
  });

  // End time presets
  const timePresets = useMemo(() => {
    const now = new Date();
    const presets: { label: string; hoursFromNow: number; timeStr: string }[] = [];

    const getHoursDelta = (targetHours: number, targetMinutes: number, addDays: number = 0) => {
      const target = new Date(now);
      target.setDate(target.getDate() + addDays);
      target.setHours(targetHours, targetMinutes, 0, 0);
      const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
      return Math.max(0.5, Math.min(24, Math.round(diffHours * 10) / 10));
    };

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
    presets.push({ label: 'Midnight', hoursFromNow: getHoursDelta(23, 59), timeStr: '11:59 PM' });
    presets.push({ label: 'Tmrw 8 AM', hoursFromNow: getHoursDelta(8, 0, 1), timeStr: 'Tomorrow 8:00 AM' });

    if (presets.length < 3) {
      return [
        { label: '2 Hours', hoursFromNow: 2, timeStr: '2 Hours' },
        { label: '4 Hours', hoursFromNow: 4, timeStr: '4 Hours' },
        { label: '8 Hours', hoursFromNow: 8, timeStr: '8 Hours' },
      ];
    }

    return presets.slice(0, 3);
  }, []);

  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [customDisplayTime, setCustomDisplayTime] = useState<string>('');
  const [customInputValue, setCustomInputValue] = useState<string>('18:00');

  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(() =>
    timePresets.length > 0 ? timePresets[0].hoursFromNow : 2
  );
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>(() =>
    timePresets.length > 0 ? timePresets[0].label : '2 Hours'
  );

  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Handle native time input change
  const handleNativeTimeChange = (timeStr: string) => {
    if (!timeStr) return;
    setCustomInputValue(timeStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If target time is earlier than now, assume tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
    const clampedHours = Math.max(0.5, Math.min(24, Math.round(diffHours * 10) / 10));
    setSelectedDurationHours(clampedHours);

    const formatted = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setCustomDisplayTime(formatted);
    setSelectedPresetLabel(formatted);
    setIsCustomSelected(true);
  };

  const openTimePicker = () => {
    if (timeInputRef.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          timeInputRef.current.showPicker();
        } else {
          timeInputRef.current.focus();
        }
      } catch {
        timeInputRef.current.focus();
      }
    }
  };

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
      // If user entered a new visitor and checked "Save for future"
      if (carMode === 'new' && saveForFuture && activePlate && activeVisitorName) {
        addSavedGuest({
          name: activeVisitorName,
          plate: activePlate,
        }).catch(() => {});
      }

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
        className="card p-3.5 bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-3xl pointer-events-auto space-y-3"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-xs shadow-md shadow-emerald-600/30">
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
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
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
                <Users className="w-3 h-3" />
                <span>Saved ({savedGuests.length})</span>
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
              <Plus className="w-3 h-3" />
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
              <Car className="w-3 h-3" />
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
                  className={`px-3 py-1.5 rounded-xl text-left border shrink-0 transition-all ${
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
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
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

              {/* Save for Future Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none px-0.5">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-slate-600">
                  Save this visitor vehicle for future bookings
                </span>
              </label>
            </div>
          )}

          {carMode === 'resident' && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedResidentPlate(v.plate_number)}
                  className={`px-3 py-1.5 rounded-xl text-left border shrink-0 transition-all ${
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

        {/* End Time Selection with Seamless Native Time Picker Pill */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Book Until
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700">
              {selectedPresetLabel}
            </span>
          </div>

          {/* 4 Clean Action Pills: Presets + Seamless Custom Time Picker */}
          <div className="grid grid-cols-4 gap-1.5">
            {timePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setIsCustomSelected(false);
                  setSelectedDurationHours(preset.hoursFromNow);
                  setSelectedPresetLabel(preset.label);
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  !isCustomSelected && selectedPresetLabel === preset.label
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}

            {/* Seamless Native Time Picker Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={openTimePicker}
                className={`w-full py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  isCustomSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {isCustomSelected && customDisplayTime ? customDisplayTime : 'Other...'}
                </span>
              </button>

              {/* Native Mobile/Browser Time Input */}
              <input
                ref={timeInputRef}
                type="time"
                value={customInputValue}
                onChange={(e) => handleNativeTimeChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
                aria-label="Choose specific time"
              />
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleStartParking}
          disabled={isSubmitting || !activePlate || bookingSuccess}
          className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
            bookingSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-600/30'
          } disabled:opacity-50`}
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
