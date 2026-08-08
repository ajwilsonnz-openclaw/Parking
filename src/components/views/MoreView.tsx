'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { User, Shield, Sliders, Smartphone, LogOut, Car, ChevronRight, Award } from 'lucide-react';
import { AccountView } from './AccountView';
import { ManagementView } from './ManagementView';
import { AdminView } from './AdminView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';

export const MoreView: React.FC = () => {
  const { currentUser, switchRole } = useApp();
  const [subView, setSubView] = useState<'main' | 'profile' | 'management' | 'admin'>('main');
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  if (subView === 'profile') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSubView('main')}
          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline mb-2"
        >
          ← Back to More
        </button>
        <AccountView />
      </div>
    );
  }

  if (subView === 'management') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSubView('main')}
          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline mb-2"
        >
          ← Back to More
        </button>
        <ManagementView />
      </div>
    );
  }

  if (subView === 'admin') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSubView('main')}
          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline mb-2"
        >
          ← Back to More
        </button>
        <AdminView />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24 animate-fade-in">
      <div className="px-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">More & Settings</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Account details, building controls & PWA app install options.
        </p>
      </div>

      {/* Profile Card */}
      <div
        onClick={() => setSubView('profile')}
        className="mockup-card p-4 flex items-center justify-between cursor-pointer hover:shadow-mockup-hover transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentUser?.name}</h3>
            <p className="text-xs text-slate-500">{currentUser?.unit_number} • {currentUser?.email}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Menu Options List */}
      <div className="mockup-card divide-y divide-slate-100 overflow-hidden">
        {/* Option 1: PWA Install */}
        <div
          onClick={() => setShowPwaGuide(true)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Install Mobile / Desktop PWA</h4>
              <p className="text-[11px] text-slate-500 font-medium">Add app icon to your phone home screen</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Option 2: Management Portal */}
        {(currentUser?.role === 'management' || currentUser?.role === 'admin') && (
          <div
            onClick={() => setSubView('management')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Building Management Portal</h4>
                <p className="text-[11px] text-slate-500 font-medium">Demerits & resident whitelist management</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}

        {/* Option 3: Admin Console */}
        {currentUser?.role === 'admin' && (
          <div
            onClick={() => setSubView('admin')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Admin Controls</h4>
                <p className="text-[11px] text-slate-500 font-medium">Global stay limits, rent caps & site layout</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* PWA Install Modal */}
      <PushPermissionGuide isOpen={showPwaGuide} onClose={() => setShowPwaGuide(false)} />
    </div>
  );
};
