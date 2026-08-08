'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Car, Bell, User, Shield, Sliders } from 'lucide-react';
import { Role } from '@/types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPushGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPushGuide,
}) => {
  const { currentUser, switchRole, config } = useApp();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'CAR PARK DASHBOARD';
      case 'verify': return 'VERIFY VEHICLES';
      case 'management': return 'MANAGEMENT PORTAL';
      case 'admin': return 'ADMIN CONSOLE';
      case 'account': return 'PROFILE';
      default: return 'MILLENNIUM VILLAGE';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0052b4] text-white shadow-md px-4 lg:px-8 py-3.5 mb-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Building Logo Badge */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white">
            <Car className="w-4 h-4" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase hidden sm:inline">
            {config.complex_name}
          </span>
        </div>

        {/* Center: Page Title (Matching Screenshot 1-4 Header Title Style) */}
        <div className="text-center">
          <h1 className="text-sm sm:text-base font-extrabold tracking-widest uppercase text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Tools: Role Selector & Push Notification Helper */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher */}
          <select
            value={currentUser?.role || 'user'}
            onChange={(e) => switchRole(e.target.value as Role)}
            className="bg-white/15 border border-white/25 rounded-lg px-2 py-1 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="user" className="text-slate-900">Resident</option>
            <option value="management" className="text-slate-900">Management</option>
            <option value="admin" className="text-slate-900">Admin</option>
          </select>

          <button
            onClick={onOpenPushGuide}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white transition-colors relative"
            title="App Alerts Setup"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
