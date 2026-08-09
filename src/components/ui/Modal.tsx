'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = 'md' }) => {
  if (!isOpen) return null;

  const maxWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 dark:bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className={`w-full ${maxWidths[maxWidth]} card relative max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="btn-icon absolute top-4 right-4 z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};
