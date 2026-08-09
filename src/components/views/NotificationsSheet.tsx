'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Bell, CheckCircle2 } from 'lucide-react';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short' }).format(d);
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose }) => {
  const { notificationLog } = useApp();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-11 h-11">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Notifications</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Alerts about your bookings and building updates.</p>
        </div>
      </div>

      {notificationLog.length === 0 ? (
        <div className="card p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink">All caught up</h4>
          <p className="text-xs text-ink-tertiary mt-1">You're up to date — we'll let you know when something needs your attention.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto -mx-2 px-2">
          {notificationLog.map((n) => (
            <div
              key={n.id}
              className="card p-3.5 border-l-4 border-l-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-ink">{n.title}</h4>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[10px] text-ink-tertiary font-semibold shrink-0 mt-0.5">
                  {formatTimestamp(n.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onClose} className="btn-primary w-full mt-4">
        Done
      </button>
    </Modal>
  );
};
