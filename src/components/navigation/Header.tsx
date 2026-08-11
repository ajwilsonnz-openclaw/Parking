'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onOpenPushGuide?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPushGuide, onOpenNotifications }) => {
  const { config, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const titleName = config.complex_name
    ? config.complex_name.toLowerCase().includes('parking')
      ? config.complex_name
      : `${config.complex_name} Parking`
    : 'Millennium Village Parking';

  return (
    <header className="w-full px-4 pt-4 pb-2 max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {/* Custom Millennium "M" Logo */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0066ff] via-[#0055e6] to-[#0044cc] flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0 border border-blue-400/20 text-white">
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M4 19V5h3l5 7 5-7h3v14h-3V9.5L12 16.5 7 9.5V19H4z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black text-ink tracking-tight font-display truncate leading-snug">
            {titleName}
          </h1>
          <p className="text-xs text-ink-secondary font-medium truncate mt-0.5">
            {config.complex_address || '548 Albany Highway, Albany'}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenNotifications || onOpenPushGuide}
        className="w-10 h-10 rounded-full border border-border bg-bg-surface text-ink flex items-center justify-center relative shrink-0 ml-2 hover:border-accent/40 transition-all active:scale-95 shadow-sm"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5 text-ink-secondary" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-bg-surface" />
      </button>
    </header>
  );
};
