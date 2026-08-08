'use client';

import React from 'react';
import { Car, Eye, User, Shield, Sliders } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface MobileTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { currentUser } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0052b4] text-white border-t border-blue-800/50 px-3 py-2 flex items-center justify-around shadow-2xl">
      {/* 1. Park Tab */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'dashboard' ? 'text-white font-bold scale-105 opacity-100' : 'text-white/70 hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-white/20' : ''}`}>
          <Car className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-wide">Park</span>
      </button>

      {/* 2. Verify Tab */}
      <button
        onClick={() => setActiveTab('verify')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'verify' ? 'text-white font-bold scale-105 opacity-100' : 'text-white/70 hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'verify' ? 'bg-white/20' : ''}`}>
          <Eye className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-wide">Verify</span>
      </button>

      {/* 3. Manage Tab */}
      {(currentUser?.role === 'management' || currentUser?.role === 'admin') && (
        <button
          onClick={() => setActiveTab('management')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'management' ? 'text-white font-bold scale-105 opacity-100' : 'text-white/70 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'management' ? 'bg-white/20' : ''}`}>
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-wide">Manage</span>
        </button>
      )}

      {/* 4. Admin Tab */}
      {currentUser?.role === 'admin' && (
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'admin' ? 'text-white font-bold scale-105 opacity-100' : 'text-white/70 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'admin' ? 'bg-white/20' : ''}`}>
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-wide">Admin</span>
        </button>
      )}

      {/* 5. Profile Tab (Matching Fire Emergency Profile Tab Name) */}
      <button
        onClick={() => setActiveTab('account')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'account' ? 'text-white font-bold scale-105 opacity-100' : 'text-white/70 hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === 'account' ? 'bg-white/20' : ''}`}>
          <User className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-wide">Profile</span>
      </button>
    </div>
  );
};
