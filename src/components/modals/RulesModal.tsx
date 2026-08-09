'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-11 h-11">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="section-title text-base">Visitor parking rules</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Please familiarise yourself with the rules.</p>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-ink-secondary leading-relaxed">
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">1</span>
          <span>Visitor parks are strictly for genuine building visitors, up to <strong className="text-ink">24 hours</strong>.</span>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">2</span>
          <span>Resident excess parking requires registration and must <strong className="text-ink">vacate</strong> if visitor availability hits 0.</span>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">3</span>
          <span>Demerit threshold: <strong className="text-ink">3 points</strong> triggers a $50 BodyCorp fine.</span>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">4</span>
          <span>All bookings must match the registered <strong className="text-ink">license plate</strong> of the visiting vehicle.</span>
        </li>
      </ul>

      <button onClick={onClose} className="btn-primary w-full mt-6">
        Understood
      </button>
    </Modal>
  );
};
