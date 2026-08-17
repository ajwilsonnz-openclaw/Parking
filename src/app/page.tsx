'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileTabBar, TabId } from '@/components/navigation/MobileTabBar';
import { HomeStatusView } from '@/components/views/HomeStatusView';
import { BookingView } from '@/components/views/BookingView';
import { StatusView } from '@/components/views/StatusView';
import { AccountView } from '@/components/views/AccountView';
import { AdminView } from '@/components/views/AdminView';
import { ManagementView } from '@/components/views/ManagementView';
import { PushPermissionGuide } from '@/components/pwa/PushPermissionGuide';
import { NotificationsSheet } from '@/components/views/NotificationsSheet';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { useApp } from '@/lib/context/AppContext';
import LoginView from '@/components/views/LoginView';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

function AuthedShell() {
  const isDemo = useDemoMode();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [bookingSectionId, setBookingSectionId] = useState<string>('sec_entrance');
  const [showPushGuide, setShowPushGuide] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [accountSubView, setAccountSubView] = useState<null | 'profile' | 'management' | 'admin'>(null);

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setAccountSubView(null);
  }, []);

  const handleNavigateToBooking = useCallback((sectionId?: string) => {
    if (sectionId) setBookingSectionId(sectionId);
    setActiveTab('booking');
    setAccountSubView(null);
  }, []);

  const isManagementOrAdmin = currentUser?.role === 'management' || currentUser?.role === 'admin';

  const tabTitle = activeTab === 'home'
    ? 'Millennium Village Parking'
    : activeTab === 'booking'
    ? 'Booking'
    : activeTab === 'status'
    ? 'Status'
    : 'Account';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--app-bg,#07130D)] text-slate-100 relative overflow-x-hidden transition-colors duration-300">
      {/* Ambient Top Dynamic Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--ambient-glow,rgba(16,185,129,0.22)),transparent_70%)] z-0" />

      <Header
        title={tabTitle}
        isDemo={isDemo}
        onOpenPushGuide={() => setShowPushGuide(true)}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3.5 pt-3 pb-24 max-w-lg mx-auto w-full relative z-10">
        {activeTab === 'home' && (
          <HomeStatusView onNavigateToBooking={handleNavigateToBooking} />
        )}

        {activeTab === 'booking' && (
          <BookingView
            initialSectionId={bookingSectionId}
            onNavigateTab={handleNavigate}
          />
        )}

        {activeTab === 'status' && (
          <StatusView />
        )}

        {activeTab === 'account' && (
          <>
            {!accountSubView && (
              <AccountView
                onOpenManagement={isManagementOrAdmin ? () => setAccountSubView('management') : undefined}
                onOpenAdmin={currentUser?.role === 'admin' ? () => setAccountSubView('admin') : undefined}
                onOpenPushGuide={() => setShowPushGuide(true)}
                onOpenOnboarding={() => setShowOnboarding(true)}
              />
            )}
            {accountSubView === 'management' && <ManagementView onBack={() => setAccountSubView(null)} />}
            {accountSubView === 'admin' && <AdminView onBack={() => setAccountSubView(null)} />}
          </>
        )}
      </main>

      <OnboardingModal forceOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <PushPermissionGuide isOpen={showPushGuide} onClose={() => setShowPushGuide(false)} />
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <MobileTabBar activeTab={activeTab} setActiveTab={handleNavigate} />
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

  if (!mounted) {
    return <div className="min-h-screen bg-[#07130D]" />;
  }

  if (isDemoParam || isAuthed) {
    return <AuthedShell />;
  }

  return <LoginView />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07130D]" />}>
      <Shell />
    </Suspense>
  );
}
