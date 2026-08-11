'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Users, Car, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { PlateCard } from '@/components/ui/PlateCard';
import { SavedGuest } from '@/types';

interface BookRegularVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuest: (guest: SavedGuest) => void;
  onGoToNormalBooking: () => void;
}

export const BookRegularVisitorModal: React.FC<BookRegularVisitorModalProps> = ({
  isOpen,
  onClose,
  onSelectGuest,
  onGoToNormalBooking,
}) => {
  const { savedGuests, removeSavedGuest, refetch } = useApp();
  const [editingGuest, setEditingGuest] = useState<SavedGuest | null>(null);
  const [editName, setEditName] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (g: SavedGuest, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGuest(g);
    setEditName(g.name);
    setEditPlate(g.plate);
    setEditPhone(g.phone || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !editName.trim() || !editPlate.trim()) return;
    setIsSaving(true);
    try {
      await fetch('/api/me/saved-guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGuest.id,
          name: editName.trim(),
          plate: editPlate.trim().toUpperCase(),
          phone: editPhone.trim() || undefined,
        }),
      });
      setEditingGuest(null);
      refetch();
    } catch {} finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete regular visitor ${name}?`)) return;
    await removeSavedGuest(id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-11 h-11">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Book Regular Visitor</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Quick-book a visitor you've saved for future visits.</p>
        </div>
      </div>

      {editingGuest ? (
        <form onSubmit={handleSaveEdit} className="space-y-3 card p-4 border-accent">
          <h4 className="text-sm font-bold text-ink">Edit Regular Visitor</h4>
          <div>
            <label className="block text-xs font-bold text-ink-tertiary uppercase mb-1">Visitor Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-tertiary uppercase mb-1">Vehicle Plate</label>
            <input type="text" value={editPlate} onChange={(e) => setEditPlate(e.target.value.toUpperCase())} required className="input text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-tertiary uppercase mb-1">Phone Number (optional)</label>
            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input text-sm" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-2 text-xs">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditingGuest(null)} className="btn-secondary py-2 text-xs">
              Cancel
            </button>
          </div>
        </form>
      ) : savedGuests.length === 0 ? (
        <div className="text-center py-6">
          <div className="icon-tile w-12 h-12 mx-auto mb-3">
            <Car className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-ink">No regular visitors saved yet</h4>
          <p className="text-xs text-ink-secondary mt-1 max-w-[260px] mx-auto">
            When you book a visitor, tick <em>"Save as regular visitor"</em> to add them here for one-tap bookings.
          </p>
          <button
            onClick={() => {
              onClose();
              onGoToNormalBooking();
            }}
            className="btn-primary mt-4 text-xs w-full py-3"
          >
            Go to Normal Booking
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {savedGuests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => {
                onClose();
                onSelectGuest(guest);
              }}
              className="card-interactive w-full p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PlateCard plate={guest.plate} size="sm" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-ink truncate">{guest.name}</h4>
                  <p className="text-[11px] text-ink-secondary truncate">{guest.phone || guest.plate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleStartEdit(guest, e)}
                  className="btn-icon p-1.5 hover:bg-accent-soft text-accent"
                  title="Edit Visitor"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(guest.id, guest.name, e)}
                  className="btn-icon p-1.5 hover:bg-danger-soft text-danger"
                  title="Delete Visitor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="chip chip-accent ml-1">Book now</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              onClose();
              onGoToNormalBooking();
            }}
            className="btn-secondary w-full mt-3 text-xs py-2.5"
          >
            Go to Normal Booking
          </button>
        </div>
      )}
    </Modal>
  );
};
