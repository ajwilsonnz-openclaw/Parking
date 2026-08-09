'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Users, Plus, Car, X } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { PlateCard } from '@/components/ui/PlateCard';

interface BookRegularVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Book a "regular visitor" — someone saved for quick re-booking.
 * If no saved guests, guide user to add one via walking through the normal booking flow.
 */
export const BookRegularVisitorModal: React.FC<BookRegularVisitorModalProps> = ({ isOpen, onClose }) => {
  const { savedGuests, carparks, bookSpot, currentUser } = useApp();
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  // Find first available visitor spot as default; real app would pick from list
  const availableSpot = carparks.find((c) => c.status === 'available' && c.spot_number.startsWith('V-')) || carparks[0];

  const handleBookGuest = (guestId: string) => {
    const guest = savedGuests.find((g) => g.id === guestId);
    if (!guest || !availableSpot) return;

    bookSpot(
      availableSpot.id,
      availableSpot.spot_number,
      guest.plate,
      4, // default 4 hours; could be a slider later
      'visitor',
      guest.name,
      guest.phone
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-11 h-11">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Book regular visitor</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Quick-book a visitor you've saved for future visits.</p>
        </div>
      </div>

      {savedGuests.length === 0 ? (
        <div className="text-center py-6">
          <div className="icon-tile w-12 h-12 mx-auto mb-3">
            <Car className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-ink">No regular visitors yet</h4>
          <p className="text-xs text-ink-secondary mt-1 max-w-[260px] mx-auto">
            When you book a visitor, tick <em>"Save as regular visitor"</em> to add them here for one-tap bookings.
          </p>
          <button onClick={onClose} className="btn-ghost mt-4 text-xs">
            Go to a normal booking
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {savedGuests.map((guest) => (
            <button
              key={guest.id}
              onClick={() => handleBookGuest(guest.id)}
              className="card-interactive w-full p-3.5 flex items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PlateCard plate={guest.plate} size="sm" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-ink truncate">{guest.name}</h4>
                  <p className="text-[11px] text-ink-secondary truncate">{guest.make_model_color || guest.plate}</p>
                </div>
              </div>
              <span className="chip chip-accent shrink-0">Book now</span>
            </button>
          ))}
        </div>
      )}

      <button onClick={onClose} className="btn-ghost w-full mt-4 text-sm">
        Close
      </button>
    </Modal>
  );
};
