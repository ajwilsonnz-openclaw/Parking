'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  ChevronDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Sparkles
} from 'lucide-react';
import { Carpark, UnitVehicle } from '@/types';

interface StickyBookingFooterProps {
  selectedSpot: Carpark | null;
  vehicles: UnitVehicle[];
  onClearSelection: () => void;
  onConfirmBooking: (params: {
    spot: Carpark;
    plateNumber: string;
    durationHours: number;
    visitorName?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const StickyBookingFooter: React.FC<StickyBookingFooterProps> = ({
  selectedSpot,
  vehicles,
  onClearSelection,
  onConfirmBooking,
  isSubmitting,
}) => {
  const [selectedPlate, setSelectedPlate] = useState<string>(() => {
    const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
    return primary ? primary.plate_number : '';
  });
  const [customPlate, setCustomPlate] = useState<string>('');
  const [isCustomPlate, setIsCustomPlate] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Auto-sync initial primary vehicle
  React.useEffect(() => {
    if (!selectedPlate && vehicles.length > 0) {
      const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
      if (primary) setSelectedPlate(primary.plate_number);
    }
  }, [vehicles, selectedPlate]);

  if (!selectedSpot) return null;

  const activePlate = isCustomPlate ? customPlate.trim().toUpperCase() : selectedPlate;

  const handleStartParking = async () => {
    if (!activePlate) return;
    try {
      await onConfirmBooking({
        spot: selectedSpot,
        plateNumber: activePlate,
        durationHours,
        visitorName: visitorName.trim() || undefined,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClearSelection();
      }, 1400);
    } catch (err) {
      // Error handled in caller
    }
  };

  const selectedVehicleObj = vehicles.find((v) => v.plate_number === selectedPlate);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-lg mx-auto p-3 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="card p-4 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl pointer-events-auto space-y-3"
      >
        {/* Top Summary Bar */}
        <div className="flex items-center justify-between">
          {/* Selected Bay Preview */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-md shadow-emerald-600/30">
              {selectedSpot.spot_number.replace('-', '')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 leading-tight">
                  Bay {selectedSpot.spot_number.replace('-', '')}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {selectedSpot.section || 'Visitor'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Complimentary Visitor Space
              </p>
            </div>
          </div>

          {/* Close / Dismiss */}
          <button
            onClick={onClearSelection}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle & Duration Selector Row (Inspired by Reference App) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Vehicle Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVehiclePicker(!showVehiclePicker)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 transition-all"
            >
              <Car className="w-3.5 h-3.5 text-slate-600" />
              <span>
                {isCustomPlate
                  ? customPlate || 'Custom Plate'
                  : selectedVehicleObj
                  ? `${selectedVehicleObj.make_model_color || 'Vehicle'} (${selectedVehicleObj.plate_number})`
                  : activePlate || 'Select Vehicle'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Vehicle Picker Popover */}
            {showVehiclePicker && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Select Unit Vehicle
                </div>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlate(v.plate_number);
                      setIsCustomPlate(false);
                      setShowVehiclePicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                      !isCustomPlate && selectedPlate === v.plate_number
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{v.make_model_color || 'Vehicle'}</span>
                    <span className="font-mono font-bold">{v.plate_number}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomPlate(true);
                    setShowVehiclePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    isCustomPlate
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enter Guest / Other Plate</span>
                </button>
              </div>
            )}
          </div>

          {/* Duration Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[1, 2, 4, 12, 24].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => setDurationHours(hrs)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  durationHours === hrs
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>

        {/* Custom Plate Input (if chosen) */}
        {isCustomPlate && (
          <div className="animate-fade-in">
            <input
              type="text"
              value={customPlate}
              onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
              placeholder="ENTER VISITOR PLATE"
              className="input w-full py-2 px-3 text-xs font-mono font-black uppercase text-center border-emerald-400"
              autoFocus
            />
          </div>
        )}

        {/* Primary Action Button ("Start Parking") */}
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
            <span>Authorising Session...</span>
          ) : bookingSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Reservation Confirmed!</span>
            </>
          ) : (
            <>
              <span>Start Parking in {selectedSpot.spot_number.replace('-', '')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
