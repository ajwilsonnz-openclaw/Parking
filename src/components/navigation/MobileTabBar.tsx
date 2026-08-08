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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl">
      {/* 1. Park Tab */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'dashboard' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Car className="w-5 h-5" />
        <span className="text-[10px]">Park</span>
      </button>

      {/* 2. Verify Tab */}
      <button
        onClick={() => setActiveTab('verify')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'verify' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Eye className="w-5 h-5" />
        <span className="text-[10px]">Verify</span>
      </button>

      {/* 3. Manage Tab (If Management / Admin) */}
      {(currentUser?.role === 'management' || currentUser?.role === 'admin') && (
        <button
          onClick={() => setActiveTab('management')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'management' ? 'text-purple-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-[10px]">Manage</span>
        </button>
      )}

      {/* 4. Admin Tab (If Admin) */}
      {currentUser?.role === 'admin' && (
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'admin' ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5 text-rose-400" />
          <span className="text-[10px]">Admin</span>
        </button>
      )}

      {/* 5. Account Tab */}
      <button
        onClick={() => setActiveTab('account')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'account' ? 'text-white font-bold scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">Account</span>
      </button>
    </div>
  );
};
