'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Bell, BellRing, Smartphone, Monitor, CheckCircle2, AlertCircle, Share, PlusSquare } from 'lucide-react';

interface PushPermissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushPermissionGuide: React.FC<PushPermissionGuideProps> = ({ isOpen, onClose }) => {
  const { addNotificationLog } = useApp();
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [osType, setOsType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      if ('Notification' in window) setPermissionState(Notification.permission);

      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) setOsType('ios');
      else if (/android/.test(ua)) setOsType('android');
      else setOsType('desktop');
    }
  }, [isOpen]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      if (res === 'granted') {
        addNotificationLog('Notifications enabled!', "You'll now receive instant carpark expiry reminders.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTestAlert = () => {
    addNotificationLog('Test alert', 'Your parking session on spot V-03 has 15 minutes remaining!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-tile w-12 h-12">
          <BellRing className="w-6 h-6" />
        </div>
        <div>
          <h3 className="section-title text-base">Push notifications</h3>
          <p className="text-xs text-text-secondary mt-0.5">Get expiry reminders & priority-vacate alerts</p>
        </div>
      </div>

      {/* Status card */}
      <div className={`card p-4 mb-5 flex items-center justify-between border-l-4 ${
        permissionState === 'granted' ? 'border-l-success' : 'border-l-warning'
      }`}>
        <div className="flex items-center gap-3">
          {permissionState === 'granted' ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <AlertCircle className="w-6 h-6 text-warning" />
          )}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Status</div>
            <div className="text-sm font-bold text-text">
              {permissionState === 'granted' ? 'Active' : permissionState === 'denied' ? 'Blocked in browser settings' : 'Not enabled'}
            </div>
          </div>
        </div>

        {permissionState !== 'granted' && permissionState !== 'denied' && (
          <button onClick={requestPermission} className="btn-primary px-4 py-2 text-xs">
            Enable
          </button>
        )}
      </div>

      {/* OS Tabs */}
      <div className="card p-1 grid grid-cols-3 gap-1 mb-4">
        <OsTab active={osType === 'ios'} onClick={() => setOsType('ios')} icon={<Smartphone className="w-3.5 h-3.5" />} label="iOS" />
        <OsTab active={osType === 'android'} onClick={() => setOsType('android')} icon={<Smartphone className="w-3.5 h-3.5" />} label="Android" />
        <OsTab active={osType === 'desktop'} onClick={() => setOsType('desktop')} icon={<Monitor className="w-3.5 h-3.5" />} label="Desktop" />
      </div>

      <div className="card p-4 text-xs text-text-secondary space-y-2.5 mb-4">
        {osType === 'ios' && (
          <>
            <div className="font-bold text-text flex items-center gap-2">
              <Share className="w-4 h-4 text-accent" /> Step 1: Open in Safari
            </div>
            <p className="pl-6">Open this app in Safari, tap the Share icon in the bottom bar.</p>
            <div className="font-bold text-text flex items-center gap-2 pt-1">
              <PlusSquare className="w-4 h-4 text-accent" /> Step 2: Add to Home Screen
            </div>
            <p className="pl-6">Launch from the home screen icon — push notifications require it.</p>
          </>
        )}
        {osType === 'android' && (
          <>
            <div className="font-bold text-text">Step 1: Tap "Enable" above</div>
            <p>When Chrome prompts <strong>Allow notifications?</strong>, tap <strong>Allow</strong>.</p>
            <div className="font-bold text-text pt-1">Step 2: Install the app</div>
            <p>Tap the 3-dots menu in Chrome → <strong>Install app</strong>.</p>
          </>
        )}
        {osType === 'desktop' && (
          <>
            <div className="font-bold text-text">Step 1: Allow permission</div>
            <p>Click the lock icon in the URL bar → set Notifications to <strong>Allow</strong>.</p>
            <div className="font-bold text-text pt-1">Step 2: Install desktop PWA</div>
            <p>Click the install icon in the address bar to run as a native desktop app.</p>
          </>
        )}
      </div>

      {/* Test */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-text-secondary">Verify it's working:</span>
        <button onClick={sendTestAlert} className="btn-ghost text-xs flex items-center gap-1.5">
          <Bell className="w-4 h-4" /> Send test alert
        </button>
      </div>
    </Modal>
  );
};

function OsTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        active ? 'text-accent bg-accent-soft shadow-sm' : 'text-text-tertiary hover:text-text'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
