'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  Building2,
  ChevronDown,
  Settings,
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Car
} from 'lucide-react';
import { BookingModal } from '@/components/parking/BookingModal';
import { InstallPromptCard } from '@/components/pwa/InstallPromptCard';

interface HomeViewProps {
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab }) => {
  const { config, sessions, carparks } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const activeSessions = sessions.filter((s) => s.is_active);
  const nextBooking = activeSessions[0];

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24 animate-fade-in">
      {/* PWA Install prompt (dismissible, auto-hides when installed) */}
      <InstallPromptCard />

      {/* 1. Building Selector Row & Settings Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 mockup-card p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                {config.complex_name || 'Millennium Village'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                123 Johnson Lane, Auckland
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        <button
          onClick={() => onNavigateTab('more')}
          className="mockup-card p-3 flex flex-col items-center justify-center text-center shrink-0 hover:bg-slate-50 transition-colors"
          title="App Settings"
        >
          <Settings className="w-4 h-4 text-slate-600 mb-0.5" />
          <span className="text-[9px] font-bold text-slate-500">Settings</span>
        </button>
      </div>

      {/* 2. Featured Electric Blue Hero Card (Matching Mockup 1) */}
      <div
        onClick={() => setShowBookingModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden"
      >
        {/* Background Car Silhouette Overlay */}
        <div className="absolute right-3 bottom-2 opacity-10 pointer-events-none">
          <Car className="w-32 h-32" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <MapPin className="w-6 h-6 fill-white text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Book a Visitor Carpark
              </h3>
              <p className="text-xs text-blue-100 mt-1 max-w-[200px] leading-snug">
                Reserve a parking space for your visitors in a few taps.
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Your upcoming bookings Card Section (Matching Mockup 1) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">Your upcoming bookings</h3>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {nextBooking ? (
          <div
            onClick={() => onNavigateTab('bookings')}
            className="mockup-card p-4 flex items-center justify-between cursor-pointer hover:shadow-mockup-hover transition-all"
          >
            <div className="flex items-center gap-3.5">
              {/* Date Box */}
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider">SAT</span>
                <span className="text-lg font-black leading-none my-0.5">10</span>
                <span className="text-[9px] font-black uppercase tracking-wider">MAY</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">Saturday, 10 May 2025</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">12:00 PM – 6:00 PM</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold mt-1">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>Spot {nextBooking.spot_number} ({nextBooking.vehicle_plate})</span>
                </div>
              </div>
            </div>

            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
            </span>
          </div>
        ) : (
          <div className="mockup-card p-4 text-center py-6">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-700 block">No Active Bookings</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Tap above to reserve a visitor park</p>
          </div>
        )}
      </div>

      {/* 4. Quick actions 4-Grid (Matching Mockup 1) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 px-1">Quick actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Action 1: New Booking */}
          <div
            onClick={() => setShowBookingModal(true)}
            className="mockup-card p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.96]"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">New Booking</span>
          </div>

          {/* Action 2: My Bookings */}
          <div
            onClick={() => onNavigateTab('bookings')}
            className="mockup-card p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.96]"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">My Bookings</span>
          </div>

          {/* Action 3: Verify Spot */}
          <div
            onClick={() => onNavigateTab('verify')}
            className="mockup-card p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.96]"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Verify Spot</span>
          </div>

          {/* Action 4: How It Works */}
          <div
            onClick={() => setShowRulesModal(true)}
            className="mockup-card p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.96]"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">How It Works</span>
          </div>
        </div>
      </div>

      {/* 5. Need to know Policy Section (Matching Mockup 1) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 px-1">Need to know</h3>
        <div className="bg-blue-50/50 rounded-3xl p-4 border border-blue-100 space-y-3">
          {/* Rule Item 1 */}
          <div
            onClick={() => setShowRulesModal(true)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Visitor parking rules</h4>
                <p className="text-[11px] text-slate-500 font-medium">Please familiarise yourself with the rules.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="border-t border-blue-100/80"></div>

          {/* Rule Item 2 */}
          <div
            onClick={() => setShowRulesModal(true)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Bookings allowed from 15 mins to 7 days.</h4>
                <p className="text-[11px] text-slate-500 font-medium">Extend or cancel your booking anytime.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          spot={carparks.find((s) => s.status === 'available') || carparks[0]}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">Millennium Village Parking Rules</h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Visitor parks are strictly for genuine building visitors up to 24 hours.</li>
              <li>Resident excess parking requires registration and must vacate if visitor availability hits 0.</li>
              <li>Demerit penalty threshold: 3 points triggers a $50 BodyCorp fine.</li>
            </ul>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
