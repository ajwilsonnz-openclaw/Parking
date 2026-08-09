'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar, TabId } from '@/components/navigation/MobileTabBar';
import { HomeView } from '@/components/views/HomeView';
import { BookingsView } from '@/components/views/BookingsView';
import { StatusView } from '@/components/views/StatusView';
import { AccountView } from '@/components/views/AccountView';
import { AdminView } from '@/components/views/AdminView';
import { ManagementView } from '@/components/views/ManagementView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';
import { NotificationsSheet } from '@/components/views/NotificationsSheet';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { useApp } from '@/lib/context/AppContext';

function Shell() {
  const isDemo = useDemoMode();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showPushGuide, setShowPushGuide] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Sub-view inside Account: null | 'profile' | 'management' | 'admin'
  const [accountSubView, setAccountSubView] = useState<null | 'profile' | 'management' | 'admin'>(null);

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setAccountSubView(null); // reset sub-view when switching tabs
  }, []);

  const isManagementOrAdmin = currentUser?.role === 'management' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenPushGuide={() => setShowPushGuide(true)}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-3 pb-32">
        {activeTab === 'home' && (
          <HomeView onNavigateTab={handleNavigate} />
        )}
        {activeTab === 'bookings' && <BookingsView />}
        {activeTab === 'status' && <StatusView />}
        {activeTab === 'account' && (
          <>
            {!accountSubView && (
              <AccountView
                onOpenManagement={isManagementOrAdmin ? () => setAccountSubView('management') : undefined}
                onOpenAdmin={currentUser?.role === 'admin' ? () => setAccountSubView('admin') : undefined}
                onOpenPushGuide={() => setShowPushGuide(true)}
              />
            )}
            {accountSubView === 'management' && <ManagementView onBack={() => setAccountSubView(null)} />}
            {accountSubView === 'admin' && <AdminView onBack={() => setAccountSubView(null)} />}
          </>
        )}
      </main>

      <PushPermissionGuide isOpen={showPushGuide} onClose={() => setShowPushGuide(false)} />
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <MobileTabBar activeTab={activeTab} setActiveTab={handleNavigate} />

      {/* Demo mode indicator */}
      {isDemo && (
        <div className="fixed top-2 right-2 z-50 px-2 py-1 rounded-full bg-warning-soft text-warning text-[10px] font-black uppercase tracking-wider border border-warning/25 shadow">
          Demo Mode
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <Shell />
    </Suspense>
  );
}
