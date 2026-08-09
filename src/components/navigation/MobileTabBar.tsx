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
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 pointer-events-none"
    >
      <div
        className="card relative mx-auto max-w-lg overflow-hidden pointer-events-auto"
        style={{
          borderRadius: '24px',
          padding: '6px 8px calc(6px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] dark:focus-visible:ring-offset-slate-950 transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                    }}
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
    </nav>
  );
};
