'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar, TabId } from '@/components/navigation/MobileTabBar';
import { CarparkMapSandbox } from '@/components/sandbox/CarparkMapSandbox';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CarparkSandboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('status');

  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    router.push(`/?tab=${tab}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white select-none">
      {/* Top Header */}
      <Header />

      {/* Sandbox Sub-Header Banner */}
      <div className="w-full max-w-lg mx-auto px-4 py-1.5 flex items-center justify-between bg-blue-950/40 border-y border-blue-500/20 text-xs">
        <div className="flex items-center gap-2 text-blue-300 font-bold">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Interactive Carpark Map (Sandbox)</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-400 hover:text-white font-extrabold text-[11px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </div>

      {/* Main Floorplan Container */}
      <main className="flex-1 w-full max-w-lg mx-auto relative px-3 pt-3 pb-24">
        <CarparkMapSandbox />
      </main>

      {/* Native Bottom Menu Bar */}
      <MobileTabBar activeTab={activeTab} setActiveTab={handleTabClick} />
    </div>
  );
}
