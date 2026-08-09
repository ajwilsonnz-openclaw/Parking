'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
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
import { LoginView } from '@/components/views/LoginView';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthedShell() {
  const isDemo = useDemoMode();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showPushGuide, setShowPushGuide] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accountSubView, setAccountSubView] = useState<null | 'profile' | 'management' | 'admin'>(null);

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setAccountSubView(null);
  }, []);

  const isManagementOrAdmin = currentUser?.role === 'management' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenPushGuide={() => setShowPushGuide(true)}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-3 pb-32">
        {activeTab === 'home' && <HomeView onNavigateTab={handleNavigate} />}
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

      {isDemo && (
        <div className="fixed top-2 right-2 z-50 px-2 py-1 rounded-full bg-warning-soft text-warning text-[10px] font-black uppercase tracking-wider border border-warning/25 shadow">
          Demo Mode
        </div>
      )}
    </div>
  );
}

function Shell() {
  const { isLoading, isAuthed } = useApp();
  const isDemoParam = useDemoMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Respect explicit ?demo=0 to exit demo mode
  useEffect(() => {
    if (searchParams?.get('demo') === '0') {
      sessionStorage.removeItem('mvp-demo');
      if (typeof window !== 'undefined' && window.location.search.includes('demo=0')) {
        router.replace(window.location.pathname);
      }
    }
  }, [searchParams, router]);

  if (!mounted || isLoading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }} />;
  }

  if (isDemoParam) {
    return <AuthedShell />;
  }

  if (!isAuthed) {
    return <LoginView />;
  }

  return <AuthedShell />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }} />}>
      <Shell />
    </Suspense>
  );
}
