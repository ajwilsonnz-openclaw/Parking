'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  User,
  Car
} from 'lucide-react';
import { BookingModal } from '@/components/parking/BookingModal';

export const BookingsView: React.FC = () => {
  const { sessions, releaseSpot, carparks } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const activeSessions = sessions.filter((s) => s.is_active);
  const pastSessions = sessions.filter((s) => !s.is_active);

  const displayedSessions = activeTab === 'upcoming' ? activeSessions : pastSessions;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24 animate-fade-in">
      {/* 1. Header Section (Matching Mockup 2) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Bookings</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View and manage your visitor parking bookings.
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="px-3 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* 2. Filter Sub-Tabs Bar (Matching Mockup 2) */}
      <div className="mockup-card p-1.5 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'upcoming'
              ? 'text-blue-600 font-extrabold bg-blue-50/80 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Upcoming</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'past'
              ? 'text-blue-600 font-extrabold bg-blue-50/80 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cancelled'
              ? 'text-blue-600 font-extrabold bg-blue-50/80 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </button>
      </div>

      {/* 3. Bookings List (Matching Mockup 2) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
          {activeTab === 'upcoming' ? 'Upcoming bookings' : activeTab === 'past' ? 'Past bookings' : 'Cancelled bookings'}
        </h3>

        {displayedSessions.length === 0 ? (
          <div className="mockup-card p-6 text-center py-10">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-700 block">No Bookings Found</span>
            <p className="text-[11px] text-slate-400 mt-0.5">You have no {activeTab} parking sessions</p>
          </div>
        ) : (
          displayedSessions.map((session) => (
            <div key={session.id} className="mockup-card p-4 space-y-3 hover:shadow-mockup-hover transition-all">
              {/* Card Top Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Date Block */}
                  <div className="w-14 h-16 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider">SAT</span>
                    <span className="text-lg font-black leading-none my-0.5">10</span>
                    <span className="text-[9px] font-black uppercase tracking-wider">MAY</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Visitor Carpark {session.spot_number}</h4>

                    <div className="text-xs text-slate-600 space-y-1 mt-1 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.visitor_name || 'John Smith'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>12:00 PM – 6:00 PM (6 hrs)</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.vehicle_plate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shrink-0">
                  {activeTab === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
              </div>

              {/* Card Bottom Actions Bar (Matching Mockup 2 Edit/Cancel buttons) */}
              {activeTab === 'upcoming' && (
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex-1 text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 py-1 border-r border-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Booking
                  </button>

                  <button
                    onClick={() => releaseSpot(session.id)}
                    className="flex-1 text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1.5 py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 4. Booking ahead? Bottom Informational Banner (Matching Mockup 2) */}
      <div className="bg-blue-50/60 rounded-3xl p-4 border border-blue-100 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Booking ahead?</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              You can book visitor parking from 15 minutes up to 7 days in advance.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          spot={carparks.find((s) => s.status === 'available') || carparks[0]}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};
