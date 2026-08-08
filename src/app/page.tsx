'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar } from '@/components/navigation/MobileTabBar';
import { DashboardView } from '@/components/views/DashboardView';
import { VerifyView } from '@/components/views/VerifyView';
import { ManagementView } from '@/components/views/ManagementView';
import { AdminView } from '@/components/views/AdminView';
import { AccountView } from '@/components/views/AccountView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';
import { RentalModal } from '@/components/parking/RentalModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [showPushGuide, setShowPushGuide] = useState<boolean>(false);
  const [showRental, setShowRental] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPushGuide={() => setShowPushGuide(true)}
      />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-2">
        {activeTab === 'dashboard' && <DashboardView onOpenRental={() => setShowRental(true)} />}
        {activeTab === 'verify' && <VerifyView />}
        {activeTab === 'management' && <ManagementView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'account' && <AccountView onOpenRental={() => setShowRental(true)} />}
      </main>

      {/* Modals */}
      <PushPermissionGuide isOpen={showPushGuide} onClose={() => setShowPushGuide(false)} />
      <RentalModal isOpen={showRental} onClose={() => setShowRental(false)} />

      {/* Native Mobile App Bottom Navigation Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
