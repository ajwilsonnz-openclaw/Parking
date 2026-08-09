'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Car, UserRound } from 'lucide-react';

export type TabId = 'home' | 'bookings' | 'status' | 'account';

interface MobileTabBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'status', label: 'Status', icon: Car },
  { id: 'account', label: 'Account', icon: UserRound },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      {/* Gradient + blur backdrop so content fades out behind the bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--bg-app) 55%, transparent)',
          // Blur above the solid gradient so it's frosted, not a hard edge
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to top, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent)',
        }}
      />

      <div className="relative px-3 pb-[calc(10px+env(safe-area-inset-bottom))]">
        <div className="card mx-auto max-w-lg overflow-hidden pointer-events-auto rounded-3xl p-1.5">
          <div className="grid grid-cols-4 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent select-none touch-manipulation"
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-2xl bg-accent-soft border border-accent-border"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-5 h-5 transition-colors ${
                      isActive ? 'text-accent' : 'text-ink-tertiary'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10px] font-bold transition-colors ${
                      isActive ? 'text-accent' : 'text-ink-tertiary'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
