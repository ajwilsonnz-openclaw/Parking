'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { X, Bell, BellRing, Smartphone, Monitor, CheckCircle, AlertCircle, Share, PlusSquare } from 'lucide-react';

interface PushPermissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushPermissionGuide: React.FC<PushPermissionGuideProps> = ({ isOpen, onClose }) => {
  const { addNotificationLog } = useApp();
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [osType, setOsType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }

      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setOsType('ios');
      } else if (/android/.test(ua)) {
        setOsType('android');
      } else {
        setOsType('desktop');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this browser version.');
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      if (res === 'granted') {
        addNotificationLog('Notifications Enabled!', 'You will now receive instant carpark expiry reminders.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTestAlert = () => {
    addNotificationLog(
      'TEST ALERT: Visitor Carpark Reminder',
      'Your parking session on spot V-03 has 15 minutes remaining!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">App Push Alert Setup</h3>
            <p className="text-xs text-slate-400">Step-by-step guide to receive time expiry & vacate alerts</p>
          </div>
        </div>

        {/* Current Permission Status Badge */}
        <div
          className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
            permissionState === 'granted'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {permissionState === 'granted' ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400" />
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">Alert Status</div>
              <div className="text-sm font-bold">
                {permissionState === 'granted' ? 'Notifications Active & Enabled' : 'Permissions Not Yet Granted'}
              </div>
            </div>
          </div>

          {permissionState !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow"
            >
              Enable Now
            </button>
          )}
        </div>

        {/* OS Specific Dummy-Proof Guide Tabs */}
        <div className="space-y-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setOsType('ios')}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
                osType === 'ios' ? 'bg-sky-600 text-white' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> iPhone / iOS
            </button>
            <button
              onClick={() => setOsType('android')}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
                osType === 'android' ? 'bg-sky-600 text-white' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android
            </button>
            <button
              onClick={() => setOsType('desktop')}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 ${
                osType === 'desktop' ? 'bg-sky-600 text-white' : 'text-slate-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> PC / Windows
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2.5">
            {osType === 'ios' && (
              <>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Share className="w-4 h-4 text-sky-400" /> Step 1: Open in Safari & Tap Share
                </div>
                <p className="pl-6 text-slate-400">Tap the Share icon at the bottom of Safari.</p>
                <div className="flex items-center gap-2 font-bold text-white pt-1">
                  <PlusSquare className="w-4 h-4 text-sky-400" /> Step 2: Tap &quot;Add to Home Screen&quot;
                </div>
                <p className="pl-6 text-slate-400">Launch the app from your home screen for native push notifications.</p>
              </>
            )}

            {osType === 'android' && (
              <>
                <div className="font-bold text-white">Step 1: Tap &quot;Enable Now&quot; above</div>
                <p className="text-slate-400">When Chrome prompts &quot;Allow notifications?&quot;, tap <strong>Allow</strong>.</p>
                <div className="font-bold text-white pt-1">Step 2: Add to Home Screen</div>
                <p className="text-slate-400">Tap the 3 dots menu in Chrome → &quot;Install App&quot; or &quot;Add to Home Screen&quot;.</p>
              </>
            )}

            {osType === 'desktop' && (
              <>
                <div className="font-bold text-white">Step 1: Allow Browser Permission</div>
                <p className="text-slate-400">Click the lock icon next to the URL bar in Chrome/Edge and select <strong>Notifications: Allow</strong>.</p>
                <div className="font-bold text-white pt-1">Step 2: Install Desktop PWA</div>
                <p className="text-slate-400">Click the small install icon in the right side of the address bar to run as a native PC app.</p>
              </>
            )}
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Verify your device alerts:</span>
          <button
            onClick={sendTestAlert}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all active:scale-95 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Send Test Push Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
