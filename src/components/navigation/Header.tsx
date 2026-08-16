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
    <header className="w-full px-4 py-3 max-w-lg mx-auto flex items-center justify-between bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Custom Logo Tile */}
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0 text-white font-black">
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M4 19V5h3l5 7 5-7h3v14h-3V9.5L12 16.5 7 9.5V19H4z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight truncate leading-snug">
            {titleName}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {config.complex_address || '548 Albany Highway, Albany'}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenNotifications || onOpenPushGuide}
        className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center relative shrink-0 ml-2 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>
    </header>
  );
};
