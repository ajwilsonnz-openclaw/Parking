'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onOpenPushGuide?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPushGuide, onOpenNotifications }) => {
  const { notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <header className="w-full px-4 pt-2.5 pb-1 max-w-lg mx-auto flex items-center justify-end">
      <button
        onClick={onOpenNotifications || onOpenPushGuide}
        className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center relative hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-3.5 h-3.5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>
    </header>
  );
};
