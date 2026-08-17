'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  isDemo?: boolean;
  onOpenPushGuide?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, isDemo, onOpenPushGuide, onOpenNotifications }) => {
  const { notifications } = useApp();
  const { paletteConfig } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <header className="w-full px-4 pt-3.5 pb-1 max-w-lg mx-auto flex items-center justify-between gap-2 z-30 relative select-none">
      <div className="min-w-0 flex-1">
        {title && (
          <h1
            className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] truncate"
            style={{ color: paletteConfig.textHeading }}
          >
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isDemo && (
          <div
            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: paletteConfig.borderPrimary,
              color: paletteConfig.accentSecondary,
            }}
          >
            Demo
          </div>
        )}

        {/* Dynamic Alert / Notification Button */}
        <button
          onClick={onOpenNotifications || onOpenPushGuide}
          className="w-8 h-8 rounded-xl border flex items-center justify-center relative transition-all active:scale-95 shadow-sm backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: paletteConfig.borderPrimary,
            color: paletteConfig.accentSecondary,
            boxShadow: `0 0 12px ${paletteConfig.ambientGlow}`,
          }}
          title="Notifications & Alerts"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-black animate-pulse"
              style={{ backgroundColor: paletteConfig.accentPrimary }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
