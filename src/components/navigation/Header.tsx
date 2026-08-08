'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Car, Bell, Eye, Users, Sliders, User } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full glass-panel rounded-none border-x-0 border-t-0 border-b border-slate-800/80 px-4 lg:px-8 py-2.5 mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Building Complex Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-glow-cyan">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white">{config.complex_name}</h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">Car Park Management</p>
          </div>
        </div>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Park
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'verify' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" /> Verify
          </button>

          {currentUser?.role === 'management' || currentUser?.role === 'admin' ? (
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'management' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Management
            </button>
          ) : null}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Admin Controls
            </button>
          )}

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'account' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Account
          </button>
        </nav>

        {/* Right Tools: Role Switcher & Push Notification Setup */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold hidden sm:inline">Role:</span>
            <select
              value={currentUser?.role || 'user'}
              onChange={(e) => switchRole(e.target.value as Role)}
              className="bg-transparent text-xs font-extrabold text-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="user">Resident</option>
              <option value="management">Management</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Alert Permission Button */}
          <button
            onClick={onOpenPushGuide}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 hover:text-white hover:border-sky-500 transition-colors relative"
            title="Notification Setup"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
