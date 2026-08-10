'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Clock } from 'lucide-react';

interface BookingTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingTimesModal: React.FC<BookingTimesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-11 h-11">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Booking Times</h3>
          <p className="text-xs text-ink-secondary mt-0.5">How long can I book for?</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-ink-secondary leading-relaxed">
        <p>
          Bookings can range from <strong className="text-ink">15 minutes</strong> up to a
          maximum of <strong className="text-ink">24 hours</strong>. You can extend or cancel your booking
          at any time from the Bookings tab.
        </p>
        <div className="card p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary">Minimum booking</span>
            <strong className="text-ink font-mono">15 min</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary">Time increments</span>
            <strong className="text-ink font-mono">15 min steps</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary">Maximum duration</span>
            <strong className="text-ink font-mono">24 hours</strong>
          </div>
        </div>
        <p className="text-xs text-ink-tertiary">
          Tip: You can select durations in 15-minute steps (e.g. 15m, 30m, 45m, 1h, 1h 30m up to 24h).
        </p>
      </div>

      <button onClick={onClose} className="btn-primary w-full mt-6">
        Got it
      </button>
    </Modal>
  );
};
