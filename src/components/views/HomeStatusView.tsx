'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { CircularRadarGauge } from '@/components/ui/CircularRadarGauge';
import {
  Car,
  Users,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HomeStatusViewProps {
  onNavigateToBooking: (sectionId?: string) => void;
  onNavigateTab?: (tab: 'home' | 'booking' | 'status' | 'account') => void;
}

export const HomeStatusView: React.FC<HomeStatusViewProps> = ({
  onNavigateToBooking,
}) => {
  const { carparks, sessions, currentUser } = useApp();
  const { paletteConfig } = useTheme();

  // Active sessions overall
  const nowMs = Date.now();
  const activeSessions = useMemo(() => {
    return sessions.filter(
      (s) => s.is_active && new Date(s.expected_end_time).getTime() > nowMs && !s.end_time
    );
  }, [sessions, nowMs]);

  // Visitor sessions vs Owner sessions
  const visitorSessionsCount = useMemo(() => {
    return activeSessions.filter((s) => s.session_type === 'visitor').length;
  }, [activeSessions]);

  const ownerSessionsCount = useMemo(() => {
    return activeSessions.filter((s) => s.session_type !== 'visitor').length;
  }, [activeSessions]);

  // Your Guests (active sessions booked by current user's unit or user ID)
  const yourGuestsCount = useMemo(() => {
    const userUnit = currentUser?.unit_number || '4';
    return activeSessions.filter(
      (s) =>
        s.session_type === 'visitor' &&
        (s.unit_number === userUnit || s.user_id === currentUser?.id)
    ).length;
  }, [activeSessions, currentUser]);

  // Total available visitor carparks
  const totalParks = carparks.length || 23;
  const occupiedCount = useMemo(() => {
    return carparks.filter((spot) => {
      return (
        spot.status === 'occupied' ||
        activeSessions.some(
          (s) =>
            s.spot_number === spot.spot_number ||
            s.spot_number.replace('-', '') === spot.spot_number.replace('-', '') ||
            s.spot_id === spot.id ||
            s.carpark_id === spot.id
        )
      );
    }).length;
  }, [carparks, activeSessions]);

  const availableVisitorCount = Math.max(0, totalParks - occupiedCount);

  return (
    <div className="flex flex-col max-w-lg mx-auto pb-4 pt-1 animate-fade-in space-y-3 px-1 select-none text-slate-100">
      {/* 1. Main Visitor Parking Status Card */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4 relative overflow-hidden backdrop-blur-xl border transition-colors"
        style={{
          backgroundColor: paletteConfig.bgCard,
          borderColor: paletteConfig.borderPrimary,
        }}
      >
        {/* Top Header Row inside Card */}
        <div className="flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg border flex items-center justify-center"
              style={{
                borderColor: paletteConfig.borderPrimary,
                color: paletteConfig.accentSecondary,
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Visitor Parking Status
            </span>
          </div>
        </div>

        {/* Circular Radar & Rotating Line Animation Component */}
        <div className="py-1">
          <CircularRadarGauge available={availableVisitorCount} total={totalParks} />
        </div>

        {/* 3 Secondary Metric Stats: Visitors, Owners, Your Guests (Symmetrical) */}
        <div
          className="grid grid-cols-3 gap-2 pt-2 border-t z-20 relative"
          style={{ borderColor: paletteConfig.borderPrimary }}
        >
          <div
            className="bg-black/30 rounded-2xl p-2.5 border space-y-1 transition-colors text-center"
            style={{ borderColor: paletteConfig.borderPrimary }}
          >
            <div
              className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-tight"
              style={{ color: paletteConfig.textMuted }}
            >
              <Users className="w-3 h-3 shrink-0" style={{ color: paletteConfig.accentPrimary }} />
              <span>Visitors</span>
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              <AnimatedNumber value={visitorSessionsCount} />
            </div>
          </div>

          <div
            className="bg-black/30 rounded-2xl p-2.5 border space-y-1 transition-colors text-center"
            style={{ borderColor: paletteConfig.borderPrimary }}
          >
            <div
              className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-tight"
              style={{ color: paletteConfig.textMuted }}
            >
              <Car className="w-3 h-3 shrink-0" style={{ color: paletteConfig.accentPrimary }} />
              <span>Owners</span>
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              <AnimatedNumber value={ownerSessionsCount} />
            </div>
          </div>

          <div
            className="bg-black/30 rounded-2xl p-2.5 border space-y-1 transition-colors text-center"
            style={{ borderColor: paletteConfig.borderPrimary }}
          >
            <div
              className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-tight"
              style={{ color: paletteConfig.textMuted }}
            >
              <UserCheck className="w-3 h-3 shrink-0" style={{ color: paletteConfig.accentPrimary }} />
              <span>Your Guests</span>
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              <AnimatedNumber value={yourGuestsCount} />
            </div>
          </div>
        </div>

        {/* Primary CTA: Book a Visitor Car Park */}
        <button
          type="button"
          onClick={() => onNavigateToBooking()}
          className="w-full py-3.5 px-4 rounded-2xl text-slate-950 font-black text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 group z-20 relative"
          style={{
            background: paletteConfig.accentGradient,
            boxShadow: `0 0 25px ${paletteConfig.ambientGlow}`,
          }}
        >
          <span>Book a Visitor Car Park</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
};
