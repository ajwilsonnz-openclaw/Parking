'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onOpenPushGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPushGuide }) => {
  const { currentUser } = useApp();

  const firstName = currentUser?.name?.split(' ')[0] || 'Adam';

  return (
    <header className="w-full bg-[#f8fafc] px-4 pt-6 pb-2 max-w-lg mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          Welcome, {firstName} <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage visitor parking with ease.
        </p>
      </div>

      <button
        onClick={onOpenPushGuide}
        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-sm relative hover:bg-slate-50 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
      </button>
    </header>
  );
};
