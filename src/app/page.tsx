'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar } from '@/components/navigation/MobileTabBar';
import { DashboardView } from '@/components/views/DashboardView';
import { ManagementView } from '@/components/views/ManagementView';
import { AdminView } from '@/components/views/AdminView';
import { AccountView } from '@/components/views/AccountView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';
import { PhysicalLookupModal } from '@/components/parking/PhysicalLookupModal';
import { RentalModal } from '@/components/parking/RentalModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [showPushGuide, setShowPushGuide] = useState<boolean>(false);
  const [showLookup, setShowLookup] = useState<boolean>(false);
  const [showRental, setShowRental] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPushGuide={() => setShowPushGuide(true)}
        onOpenLookup={() => setShowLookup(true)}
      />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-2">
        {activeTab === 'dashboard' && <DashboardView onOpenRental={() => setShowRental(true)} />}
        {activeTab === 'management' && <ManagementView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'account' && <AccountView onOpenRental={() => setShowRental(true)} />}
      </main>

      {/* Modals & Dialogs */}
      <PushPermissionGuide isOpen={showPushGuide} onClose={() => setShowPushGuide(false)} />
      <PhysicalLookupModal isOpen={showLookup} onClose={() => setShowLookup(false)} />
      <RentalModal isOpen={showRental} onClose={() => setShowRental(false)} />

      {/* Native Mobile App Bottom Navigation Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLookup={() => setShowLookup(true)}
      />
    </div>
  );
}
