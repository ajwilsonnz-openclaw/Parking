'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  User, Award, ChevronRight, Smartphone, Moon, Sun, Monitor,
  LogOut, Shield, Sliders, Trash2, Users, Key, Fingerprint, PlusCircle,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';
import { useAuth } from '@clerk/nextjs';
import { RentalModal } from '@/components/parking/RentalModal';
import { startRegistration } from '@simplewebauthn/browser';

interface AccountViewProps {
  onOpenManagement?: () => void;
  onOpenAdmin?: () => void;
  onOpenPushGuide?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenManagement, onOpenAdmin, onOpenPushGuide }) => {
  const { currentUser, vehicles, demerits, carparks, config, logout, savedGuests, removeSavedGuest } = useApp();
  const { theme, setTheme } = useTheme();
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();
  const { signOut } = useAuth();
  const [showRentalModal, setShowRentalModal] = useState(false);

  const unitNumber = currentUser?.unit_number || 'Unit 402';
  const unitVehicles = vehicles.filter((v) => v.unit_number === unitNumber);
  const unitDemerits = demerits.filter((d) => d.unit_number === unitNumber);
  const totalDemeritPoints = unitDemerits.reduce((s, d) => s + d.demerit_points, 0);
  const mySpot = carparks.find((c) => c.owner_unit_number === unitNumber);

  const isManagementOrAdmin = currentUser?.role === 'management' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const handleSignOut = async () => {
    if (!confirm('Sign out of Millennium Village Parking on this device?')) return;
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    try { await signOut(); } catch {}
    window.location.href = '/';
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-lg mx-auto pb-32">
      {/* Profile header */}
      <div className="flex flex-col items-center justify-center text-center py-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-ink tracking-tight font-display">{currentUser?.name}</h2>
        <div className="text-xs font-bold text-accent uppercase tracking-widest mt-0.5">
          {currentUser?.role} Â· {unitNumber}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block mb-1">Unit</span>
          <span className="text-3xl font-black text-ink">{currentUser?.unit_number?.replace(/^Unit\s+/i, '') || '-'}</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block mb-1">Demerit Points</span>
          <span className={`text-3xl font-black ${totalDemeritPoints > 0 ? 'text-warning' : 'text-success'}`}>{totalDemeritPoints}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="icon-tile w-10 h-10"><User className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">Home Unit</span>
            <span className="text-sm font-bold text-ink truncate block">{unitNumber} Â· {currentUser?.phone}</span>
            <span className="text-[11px] text-ink-secondary truncate block">{currentUser?.email}</span>
          </div>
        </div>
        {mySpot && (
          <button onClick={() => setShowRentalModal(true)} className="w-full btn-ghost text-xs flex items-center justify-center gap-1.5 border border-dashed border-border rounded-2xl py-2.5">
            <Key className="w-3.5 h-3.5" />
            Make personal carpark available
          </button>
        )}
      </div>

      {/* Registered Vehicles */}
      <Section title="Registered Vehicles">
        {unitVehicles.length === 0 ? (
          <div className="card p-4 text-xs text-ink-tertiary text-center">No vehicles registered yet.</div>
        ) : (
          unitVehicles.map((v) => (
            <div key={v.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PlateCard plate={v.plate_number} size="sm" />
                <span className="text-xs text-ink-secondary block mt-1.5 font-medium truncate">{v.make_model_color}</span>
              </div>
              <span className="chip chip-success shrink-0">{v.status === 'pending' ? 'Pending approval' : 'Approved'}</span>
            </div>
          ))
        )}
      </Section>

      {/* Saved guests */}
      <Section title="Saved regular visitors">
        {savedGuests.length === 0 ? (
          <div className="card p-4 text-xs text-ink-tertiary text-center">
            When you book a visitor, tick "Save as regular visitor" to add them here for one-tap bookings.
          </div>
        ) : (
          savedGuests.map((g) => (
            <div key={g.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PlateCard plate={g.plate} size="sm" />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Users className="w-3.5 h-3.5 text-ink-tertiary" />
                  <span className="text-xs text-ink font-bold truncate">{g.name}</span>
                  {g.make_model_color && (
                    <span className="text-[11px] text-ink-tertiary truncate">Â· {g.make_model_color}</span>
                  )}
                </div>
              </div>
              <button onClick={() => removeSavedGuest(g.id)} className="btn-icon p-2 text-danger hover:bg-danger-soft" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </Section>

      {/* Sign-in & security (passkey manager) */}
      <SignInSecurityCard />

      {/* Demerit history */}
      <Section title="Demerit history">
        {unitDemerits.length === 0 ? (
          <div className="card p-4 text-center">
            <Award className="w-6 h-6 text-success mx-auto mb-1" />
            <span className="text-xs font-bold text-ink block">Clean compliance record</span>
            <span className="text-[11px] text-ink-tertiary">No demerits issued</span>
          </div>
        ) : (
          unitDemerits.map((d) => (
            <div key={d.id} className="card p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <span className="chip chip-warning text-[10px] uppercase">+{d.demerit_points} Pts Â· {d.spot_number}</span>
                {d.fine_amount > 0 && <span className="chip chip-danger text-[10px]">${d.fine_amount} fine</span>}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">{d.description}</p>
            </div>
          ))
        )}
      </Section>

      {/* Preferences: Theme + PWA install */}
      <Section title="Preferences">
        <div className="card p-1.5 grid grid-cols-3 gap-1">
          <ThemeTab icon={<Monitor className="w-4 h-4" />} label="System" value="system" current={theme} onSelect={setTheme} />
          <ThemeTab icon={<Sun className="w-4 h-4" />} label="Light" value="light" current={theme} onSelect={setTheme} />
          <ThemeTab icon={<Moon className="w-4 h-4" />} label="Dark" value="dark" current={theme} onSelect={setTheme} />
        </div>

        {!isInstalled && (
          <button
            onClick={() => (isIos ? onOpenPushGuide?.() : install())}
            disabled={!canInstall && !isIos}
            className="card-interactive w-full p-3.5 flex items-center gap-3 text-left disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="icon-tile w-9 h-9"><Smartphone className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-ink">
                Install Millennium Village Parking
              </h4>
              <p className="text-[11px] text-ink-secondary font-medium truncate">
                {canInstall ? 'Tap to add this app to your home screen' : isIos ? 'Add to Home Screen via Share menu' : 'Add to your home screen for quick access'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-tertiary" />
          </button>
        )}
      </Section>

      {/* Building Controls (role-gated) */}
      {isManagementOrAdmin && (
        <Section title="Building controls">
          {isManagementOrAdmin && (
            <ControlRow
              icon={<Shield className="w-5 h-5" />}
              title="Management portal"
              description="Demerits & resident whitelist"
              onClick={onOpenManagement}
            />
          )}
          {isAdmin && (
            <ControlRow
              icon={<Sliders className="w-5 h-5" />}
              title="Admin controls"
              description="Stay limits, settings & site layout"
              onClick={onOpenAdmin}
            />
          )}
        </Section>
      )}

      {/* Sign out */}
      <button onClick={handleSignOut}
        className="card-interactive w-full py-3.5 rounded-2xl text-center font-extrabold text-xs uppercase tracking-widest text-ink-secondary hover:text-ink transition-all flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        <span>Sign out</span>
      </button>

      {mySpot && (
        <RentalModal
          spot={mySpot}
          isOpen={showRentalModal}
          onClose={() => setShowRentalModal(false)}
        />
      )}
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="section-title px-1 text-xs uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ThemeTab({ icon, label, value, current, onSelect }: { icon: React.ReactNode; label: string; value: 'light' | 'dark' | 'system'; current: string; onSelect: (v: 'light' | 'dark' | 'system') => void }) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
        active ? 'text-accent bg-accent-soft shadow-sm' : 'text-ink-tertiary hover:text-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ControlRow({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="card-interactive w-full p-3.5 flex items-center gap-3 text-left">
      <div className="icon-tile w-9 h-9">{icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-ink">{title}</h4>
        <p className="text-[11px] text-ink-secondary font-medium truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-ink-tertiary" />
    </button>
  );
}

function SignInSecurityCard() {
  const { currentUser } = useApp();
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me/passkeys');
        if (res.ok) {
          const data = await res.json();
          setPasskeys(data.passkeys || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const addAnother = async () => {
    try {
      setLoading(true);
      const optRes = await fetch('/api/auth/passkeys/register-options', { method: 'POST' });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error);
      const attestation = await startRegistration(optData.options as any);
      const verRes = await fetch('/api/auth/passkeys/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: optData.challengeId, attestation, deviceLabel: null }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error);
      const res = await fetch('/api/me/passkeys');
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data.passkeys || []);
      }
    } catch (e: any) {
      if (e?.name !== 'NotAllowedError') alert(e.message || 'Failed to add passkey');
    } finally {
      setLoading(false);
    }
  };

  const removePasskey = async (id: string) => {
    if (!confirm('Remove this device from your account?')) return;
    try {
      await fetch('/api/me/passkeys?id=' + encodeURIComponent(id), { method: 'DELETE' });
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const findDeviceLabel = (pk: any) => {
    const ua = pk.platform || '';
    if (/iPhone/i.test(ua)) return 'This iPhone';
    if (/iPad/i.test(ua)) return 'This iPad';
    if (/Android/i.test(ua)) return 'This Android';
    if (/Macintosh/i.test(ua)) return 'This Mac';
    if (/Windows/i.test(ua)) return 'This Windows PC';
    return pk.device_label || 'Registered device';
  };

  return (
    <Section title="Sign-in & security">
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="icon-tile w-9 h-9"><Fingerprint className="w-5 h-5" /></div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-ink">Biometric sign-in</h4>
            <p className="text-[11px] text-ink-secondary">Unlock this app instantly with FaceID / TouchID.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {passkeys.map((pk) => (
            <div key={pk.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-bg">
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">{findDeviceLabel(pk)}</div>
                <div className="text-[10px] text-ink-tertiary">
                  {pk.last_used_at ? `Last used ${new Date(pk.last_used_at).toLocaleDateString()}` : 'Not used yet'}
                </div>
              </div>
              <button onClick={() => removePasskey(pk.id)} className="btn-icon p-1.5 text-danger hover:bg-danger-soft" aria-label="Remove device">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {passkeys.length === 0 && !loading && (
            <div className="p-3 rounded-xl bg-bg text-xs text-ink-tertiary text-center">
              No devices registered yet.
            </div>
          )}
        </div>

        <button
          onClick={addAnother}
          disabled={loading}
          className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs font-bold text-ink-secondary hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add another device</span>
        </button>
      </div>
    </Section>
  );
}

