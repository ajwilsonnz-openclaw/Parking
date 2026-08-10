'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Bell, Building2, Car, ShieldCheck, Zap, Compass } from 'lucide-react';

interface HeaderProps {
  onOpenPushGuide?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPushGuide, onOpenNotifications }) => {
  const { config, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const iconType = config.header_icon || 'building';

  const renderIcon = () => {
    switch (iconType) {
      case 'car':
        return <Car className="w-6 h-6 text-white" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-white" />;
      case 'zap':
        return <Zap className="w-6 h-6 text-white" />;
      case 'compass':
        return <Compass className="w-6 h-6 text-white" />;
      case 'building':
      default:
        return <Building2 className="w-6 h-6 text-white" />;
    }
  };

  const titleName = config.complex_name
    ? config.complex_name.toLowerCase().includes('parking')
      ? config.complex_name
      : `${config.complex_name} Parking`
    : 'Millennium Village Parking';

  return (
    <header className="w-full px-4 pt-5 pb-3 max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black text-ink tracking-tight font-display truncate leading-snug">
            {titleName}
          </h1>
          <p className="text-xs text-ink-secondary font-medium truncate mt-0.5">
            {config.complex_address || '548 Albany Highway, Albany'}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenNotifications || onOpenPushGuide}
        className="btn-icon relative shrink-0 ml-2"
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
