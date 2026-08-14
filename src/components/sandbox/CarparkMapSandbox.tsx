'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  Shield,
  RefreshCw,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { SpatialFloorplan, ParkingBayData, CANONICAL_VECTOR_BAYS } from './SpatialFloorplan';

export const CarparkMapSandbox: React.FC = () => {
  const { carparks, sessions, vehicles, bookSpot, refetch } = useApp();

  const [selectedBay, setSelectedBay] = useState<ParkingBayData | null>(null);
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [visitorName, setVisitorName] = useState<string>('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Set default plate from user's primary vehicle on mount
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
      if (primary && !plateNumber) {
        setPlateNumber(primary.plate_number);
      }
    }
  }, [vehicles, plateNumber]);

  // Dynamically compute live status of all real-world bays
  const dynamicBays = useMemo(() => {
    const activeSpotMap = new Map<string, any>();

    (sessions || []).forEach((s) => {
      const nowMs = Date.now();
      const endMs = new Date(s.expected_end_time).getTime();
      if (s.is_active && endMs > nowMs && !s.end_time) {
        const spot = String(s.spot_number || '').toUpperCase().trim();
        const norm = spot.replace(/^([VR])-?0*(\d+)$/, '$1-$2');
        const compact = spot.replace(/^([VR])-?0*(\d+)$/, '$1$2');
        activeSpotMap.set(spot, s);
        activeSpotMap.set(norm, s);
        activeSpotMap.set(compact, s);
      }
    });

    (carparks || []).forEach((c) => {
      if (c.status === 'occupied' || c.status === 'rented') {
        const spot = String(c.spot_number || '').toUpperCase().trim();
        const norm = spot.replace(/^([VR])-?0*(\d+)$/, '$1-$2');
        const compact = spot.replace(/^([VR])-?0*(\d+)$/, '$1$2');
        if (!activeSpotMap.has(spot)) {
          activeSpotMap.set(spot, { vehicle_plate: 'OCCUPIED' });
          activeSpotMap.set(norm, { vehicle_plate: 'OCCUPIED' });
          activeSpotMap.set(compact, { vehicle_plate: 'OCCUPIED' });
        }
      }
    });

    return CANONICAL_VECTOR_BAYS.map((bay) => {
      const rawNum = bay.bayNumber.toUpperCase().trim();
      const norm = rawNum.replace(/^([VR])-?0*(\d+)$/, '$1-$2');
      const compact = rawNum.replace(/^([VR])-?0*(\d+)$/, '$1$2');

      const activeSession = activeSpotMap.get(rawNum) || activeSpotMap.get(norm) || activeSpotMap.get(compact);

      let status = bay.status;
      if (activeSession) {
        status = 'occupied';
      }

      return {
        ...bay,
        status,
        sessionPlate: activeSession?.vehicle_plate || undefined,
        sessionVisitor: activeSession?.visitor_name || undefined,
      };
    });
  }, [sessions, carparks]);

  const handleSelectBay = (bay: ParkingBayData) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch {}
    }
    setSelectedBay(bay);
    setBookingSuccess(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedBay || !plateNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const targetSpot = carparks.find(
        (c) =>
          c.spot_number.toUpperCase() === selectedBay.bayNumber.toUpperCase() ||
          c.spot_number.toUpperCase() === selectedBay.bayNumber.replace(/^([VR])-?0*(\d+)$/, '$1$2').toUpperCase() ||
          c.spot_number.toUpperCase() === selectedBay.bayNumber.replace(/^([VR])-?0*(\d+)$/, '$1-$2').toUpperCase()
      ) || carparks[0];

      const spotId = targetSpot?.id || `spot_${selectedBay.bayNumber.toLowerCase().replace('-', '')}`;
      const spotNum = targetSpot?.spot_number || selectedBay.bayNumber;

      await bookSpot(
        spotId,
        spotNum,
        plateNumber.trim().toUpperCase(),
        durationHours,
        'visitor',
        visitorName.trim() || undefined
      );

      setBookingSuccess(true);
      await refetch();

      setTimeout(() => {
        setSelectedBay(null);
        setBookingSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to book parking spot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 pb-8">
      {/* Top Header Row with Refresh */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Real Site Layout Floorplan
          </span>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* 2D Vector Schematic Floorplan */}
      <SpatialFloorplan
        bays={dynamicBays}
        selectedBayId={selectedBay?.id || null}
        onSelectBay={handleSelectBay}
      />

      {/* Selected Bay Bottom Sheet Modal */}
      <AnimatePresence>
        {selectedBay && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBay(null)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl z-50 overflow-hidden text-white"
            >
              {/* Sheet Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

              {/* Bay Details Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">
                        Bay {selectedBay.bayNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                          selectedBay.type === 'visitor'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {selectedBay.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {selectedBay.zone === 'front'
                        ? 'Front Wing · Albany Hwy Entrance'
                        : 'Rear Wing · Back Courtyard'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`chip text-xs font-black py-1 px-2.5 rounded-full flex items-center gap-1 ${
                      selectedBay.status === 'available'
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border border-slate-600 text-slate-300'
                    }`}
                  >
                    {selectedBay.status === 'available' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {selectedBay.status === 'occupied' && <Clock className="w-3 h-3 text-slate-400" />}
                    {selectedBay.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setSelectedBay(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Occupied State Notice */}
              {selectedBay.status === 'occupied' && (
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5 mb-4 text-slate-300">
                  <div className="flex justify-between font-bold text-white">
                    <span>Vehicle In Bay:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedBay.sessionPlate || 'OCCUPIED'}</span>
                  </div>
                  {selectedBay.sessionVisitor && (
                    <div className="flex justify-between">
                      <span>Visitor:</span>
                      <span>{selectedBay.sessionVisitor}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 pt-1">
                    This space is currently occupied. Please select an available green visitor bay to book.
                  </p>
                </div>
              )}

              {/* Resident Spot Notice */}
              {selectedBay.type === 'resident' && selectedBay.status === 'available' && (
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Assigned Resident Carpark. Reserved for designated apartment owner/tenant.</span>
                </div>
              )}

              {/* Booking Form for Available Visitor Bay */}
              {selectedBay.type === 'visitor' && selectedBay.status === 'available' && (
                <div className="space-y-3.5">
                  {/* Vehicle Registration Plate Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                        Vehicle Registration Plate
                      </label>
                      {vehicles && vehicles.length > 0 && (
                        <span className="text-[10px] text-blue-400 font-bold">Quick Select</span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      className="input w-full font-mono font-black text-base uppercase bg-slate-950 border-slate-700 text-white"
                      placeholder="e.g. ABC123"
                    />

                    {/* Quick Select Saved Vehicles */}
                    {vehicles && vehicles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {vehicles.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setPlateNumber(v.plate_number)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                              plateNumber === v.plate_number
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {v.plate_number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visitor Name (Optional) */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Visitor / Guest Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="input w-full text-xs font-bold bg-slate-950 border-slate-700 text-white"
                      placeholder="e.g. John Smith"
                    />
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Parking Duration
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 4, 12, 24].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setDurationHours(hours)}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                            durationHours === hours
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBay(null)}
                      className="w-1/3 btn-ghost py-3 text-xs font-bold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReservation}
                      disabled={isSubmitting || !plateNumber.trim() || bookingSuccess}
                      className={`w-2/3 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                        bookingSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-[0.98]'
                      } disabled:opacity-50`}
                    >
                      {isSubmitting ? (
                        <span>Confirming...</span>
                      ) : bookingSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Reservation Confirmed!</span>
                        </>
                      ) : (
                        <>
                          <span>Book Bay {selectedBay.bayNumber}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Close Button for Non-Bookable Bay */}
              {(selectedBay.type === 'resident' || selectedBay.status === 'occupied') && (
                <button
                  type="button"
                  onClick={() => setSelectedBay(null)}
                  className="w-full btn-secondary py-3 text-xs font-bold mt-2"
                >
                  Close
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
