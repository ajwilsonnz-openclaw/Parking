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
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg">
      <div className="max-w-lg mx-auto px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl focus:outline-none select-none touch-manipulation transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-emerald-50 border border-emerald-200"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-5 h-5 transition-colors ${
                    isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-400 stroke-[2]'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-bold tracking-tight transition-colors ${
                    isActive ? 'text-emerald-800 font-extrabold' : 'text-slate-500'
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
