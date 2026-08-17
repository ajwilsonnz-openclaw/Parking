'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Car, UserRound } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeProvider';

export type TabId = 'home' | 'booking' | 'status' | 'account';

interface MobileTabBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'booking', label: 'Booking', icon: Calendar },
  { id: 'status', label: 'Status', icon: Car },
  { id: 'account', label: 'Account', icon: UserRound },
];

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, setActiveTab }) => {
  const { paletteConfig } = useTheme();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 w-full backdrop-blur-2xl border-t shadow-[0_-4px_25px_rgba(0,0,0,0.6)] transition-colors"
      style={{
        backgroundColor: `${paletteConfig.bgApp}E6`, // 90% opacity
        borderColor: paletteConfig.borderPrimary,
      }}
    >
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
                    className="absolute inset-0 rounded-xl border transition-all"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderColor: paletteConfig.accentSecondary,
                      boxShadow: `0 0 12px ${paletteConfig.ambientGlow}`,
                    }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                <Icon
                  className="relative z-10 w-5 h-5 transition-colors"
                  style={{
                    color: isActive ? paletteConfig.accentSecondary : 'rgba(255,255,255,0.3)',
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
                <span
                  className="relative z-10 text-[10px] font-bold tracking-tight transition-colors"
                  style={{
                    color: isActive ? paletteConfig.textHeading : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 800 : 600,
                  }}
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
