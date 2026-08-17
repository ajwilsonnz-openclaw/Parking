'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Car,
  AlertTriangle,
  Building2,
  Database,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Sliders,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/badge';

interface PortalSidebarProps {
  currentTab: string;
  onTabChange?: (tab: string) => void;
}

export function PortalSidebar({ currentTab, onTabChange }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, sessions, whitelist, units } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'ajwilsonnz@gmail.com';
  const isMgmt = isAdmin || currentUser?.role === 'management';

  const activeSessionsCount = sessions.filter((s) => s.is_active).length;
  const residentsCount = whitelist.length;
  const unitsCount = units.length || 27;

  const handleNav = (targetPath: string, tab: string) => {
    if (pathname === targetPath && onTabChange) {
      onTabChange(tab);
    } else {
      router.push(`${targetPath}?tab=${tab}`);
    }
  };

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div className="space-y-5 p-4 overflow-y-auto">
        {/* Brand & Portal Title */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm shadow-md border border-rose-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black text-white tracking-wide">Millennium Village</h1>
            <p className="text-[10px] text-slate-400 font-medium">Community Management</p>
          </div>
        </div>

        {/* User Identity Pill */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white truncate max-w-[130px]">
              {currentUser?.name || 'Adam Wilson'}
            </span>
            <Badge
              variant={isAdmin ? 'destructive' : 'secondary'}
              className="text-[9px] px-1.5 py-0 h-4 font-black"
            >
              {isAdmin ? 'Super Admin' : 'Manager'}
            </Badge>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>{currentUser?.unit_number || 'Unit 5'}</span>
            <span className="text-slate-500 truncate max-w-[100px]">{currentUser?.email}</span>
          </div>
        </div>

        {/* Navigation Group 1: Property Management */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Management</span>
            <ShieldCheck className="w-3 h-3 text-blue-400" />
          </div>

          <button
            type="button"
            onClick={() => handleNav('/management', 'whitelist')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              pathname === '/management' && currentTab === 'whitelist'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0 opacity-80" />
              <span>Resident Directory</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-slate-300">
              {residentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('/management', 'sessions')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              pathname === '/management' && currentTab === 'sessions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Car className="w-4 h-4 shrink-0 opacity-80" />
              <span>Live Stays & Bays</span>
            </div>
            {activeSessionsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {activeSessionsCount} active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav('/management', 'demerits')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
              pathname === '/management' && currentTab === 'demerits'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 opacity-80" />
              <span>Demerit Enforcement</span>
            </div>
          </button>
        </div>

        {/* Navigation Group 2: Super Admin (Visible to Admins) */}
        {isAdmin && (
          <div className="space-y-1 pt-3 border-t border-white/10">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center justify-between">
              <span>Super Admin Systems</span>
              <Sliders className="w-3 h-3 text-rose-400" />
            </div>

            <button
              type="button"
              onClick={() => handleNav('/admin', 'units')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                pathname === '/admin' && currentTab === 'units'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 shrink-0 opacity-80" />
                <span>Units & Park Quotas</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-slate-300">
                {unitsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/admin', 'd1_studio')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                pathname === '/admin' && currentTab === 'd1_studio'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 shrink-0 opacity-80" />
                <span>D1 Database Studio</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/admin', 'cloudflare_meter')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                pathname === '/admin' && currentTab === 'cloudflare_meter'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 shrink-0 opacity-80" />
                <span>Cloudflare Usage Meter</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/admin', 'settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                pathname === '/admin' && currentTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 shrink-0 opacity-80" />
                <span>Complex Rules & Config</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Mobile Parking App</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </Link>
      </div>
    </aside>
  );
}
