'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onOpenPushGuide: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPushGuide, onOpenNotifications }) => {
  const { currentUser, notificationLog } = useApp();

  const firstName = currentUser?.name?.split(' ')[0] || 'Resident';
  const unreadCount = 0; // TODO: once we have real notification read state in the DB

  return (
    <header className="w-full px-4 pt-6 pb-2 max-w-lg mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black text-ink tracking-tight flex items-center gap-1.5 font-display">
          Kia ora, {firstName} <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-ink-secondary font-medium mt-0.5">
          Manage visitor parking with ease.
        </p>
      </div>

      <button
        onClick={onOpenNotifications || onOpenPushGuide}
        className="btn-icon relative"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent ring-2"
            style={{ '--tw-ring-color': 'var(--bg-surface)' } as React.CSSProperties}
          />
        )}
      </button>
    </header>
  );
};
