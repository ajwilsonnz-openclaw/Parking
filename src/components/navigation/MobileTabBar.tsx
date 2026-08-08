'use client';

import React from 'react';
import { Home, Calendar, Eye, MoreHorizontal } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-2.5 max-w-lg mx-auto shadow-lg">
      <div className="flex items-center justify-between">
        {/* 1. Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* 2. Bookings */}
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'bookings' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Bookings</span>
        </button>

        {/* 3. Verify */}
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'verify' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Verify</span>
        </button>

        {/* 4. More */}
        <button
          onClick={() => setActiveTab('more')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'more' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </div>
    </nav>
  );
};
