'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar } from '@/components/navigation/MobileTabBar';
import { HomeView } from '@/components/views/HomeView';
import { BookingsView } from '@/components/views/BookingsView';
import { VerifyView } from '@/components/views/VerifyView';
import { MoreView } from '@/components/views/MoreView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showPushGuide, setShowPushGuide] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top App Header */}
      <Header onOpenPushGuide={() => setShowPushGuide(true)} />

      {/* Main View Area */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-2">
        {activeTab === 'home' && <HomeView onNavigateTab={(t) => setActiveTab(t)} />}
        {activeTab === 'bookings' && <BookingsView />}
        {activeTab === 'verify' && <VerifyView />}
        {activeTab === 'more' && <MoreView />}
      </main>

      {/* App Push / PWA Install Guide */}
      <PushPermissionGuide isOpen={showPushGuide} onClose={() => setShowPushGuide(false)} />

      {/* Restructured Bottom Mobile Navigation Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
