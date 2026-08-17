'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useTheme, PALETTES } from '@/lib/theme/ThemeProvider';
import Link from 'next/link';
import {
  User, Award, ChevronRight, Smartphone, LogOut, Shield, Sliders, Trash2, Users, Key, Plus, Car, Check, X, Edit2, Sparkles, MapPin,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';
import { useAuth } from '@clerk/nextjs';
import { RentalModal } from '@/components/parking/RentalModal';

interface AccountViewProps {
  onOpenManagement?: () => void;
  onOpenAdmin?: () => void;
  onOpenPushGuide?: () => void;
  onOpenOnboarding?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onOpenManagement,
  onOpenAdmin,
  onOpenPushGuide,
  onOpenOnboarding,
}) => {
  const { currentUser, vehicles, demerits, carparks, logout, savedGuests, removeSavedGuest, addVehicle, removeVehicle, units, refetch } = useApp();
  const { palette, paletteConfig, setPalette } = useTheme();
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();
  const { signOut } = useAuth();
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Edit Profile state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editUnit, setEditUnit] = useState(currentUser?.unit_number || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New vehicle form state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newMakeModel, setNewMakeModel] = useState('');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  const unitNumber = currentUser?.unit_number || 'Unit 5';
  const unitVehicles = vehicles.filter((v) => v.unit_number === unitNumber || v.user_id === currentUser?.id);
  const unitDemerits = demerits.filter((d) => d.unit_number === unitNumber);
  const totalDemeritPoints = unitDemerits.reduce((s, d) => s + d.demerit_points, 0);
  const mySpot = carparks.find((c) => c.owner_unit_number === unitNumber);
  const assignedParksCount = currentUser?.assigned_parks || 1;

  const isManagementOrAdmin = currentUser?.role === 'management' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const handleSignOut = async () => {
    if (!confirm('Sign out of Millennium Village Parking on this device?')) return;
    try { await signOut(); } catch {}
    try { await logout(); } catch {}
  };

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || '');
    setEditPhone(currentUser?.phone || '');
    setEditUnit(currentUser?.unit_number || '');
    setShowEditProfileModal(true);
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      await fetch('/api/me/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          unit_number: editUnit.trim() || currentUser?.unit_number,
        }),
      });
      setShowEditProfileModal(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    setIsAddingVehicle(true);
    try {
      await addVehicle(newPlate.trim().toUpperCase(), newMakeModel.trim());
      setNewPlate('');
      setNewMakeModel('');
      setShowAddVehicleModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add vehicle');
    } finally {
      setIsAddingVehicle(false);
    }
  };

  const handleRemoveVehicle = async (id: string, plate: string) => {
    if (!confirm(`Remove vehicle ${plate} from your profile?`)) return;
    await removeVehicle(id);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-lg mx-auto pb-32">
      {/* Profile header */}
      <div className="flex flex-col items-center justify-center text-center py-4">
        <div
          className="w-20 h-20 rounded-3xl text-slate-950 flex items-center justify-center mb-3 transition-all"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 25px var(--ambient-glow)',
          }}
        >
          <User className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight font-display">{currentUser?.name}</h2>
        <div
          className="text-xs font-bold uppercase tracking-widest mt-0.5"
          style={{ color: 'var(--accent-secondary)' }}
        >
          {currentUser?.role} · {unitNumber}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Unit</span>
          <span className="text-xl font-black text-white">{currentUser?.unit_number?.replace(/^Unit\s+/i, '') || '-'}</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Assigned Parks</span>
          <span className="text-xl font-black" style={{ color: 'var(--accent-secondary)' }}>{assignedParksCount}</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Demerits</span>
          <span className={`text-xl font-black ${totalDemeritPoints > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{totalDemeritPoints}</span>
        </div>
      </div>

      {/* Contact & Edit Profile */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-black/40 border flex items-center justify-center shrink-0" style={{ borderColor: 'var(--card-border)', color: 'var(--accent-secondary)' }}>
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Resident Account</span>
              <span className="text-sm font-bold text-white truncate block">{unitNumber} · {currentUser?.phone || 'No phone set'}</span>
              <span className="text-[11px] text-slate-400 truncate block">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={handleOpenEditProfile}
            className="py-1.5 px-3 rounded-xl border hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 shrink-0"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: 'var(--card-border)',
              color: 'var(--accent-secondary)',
            }}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>

        {showEditProfileModal && (
          <form onSubmit={handleSaveProfileSubmit} className="card p-4 space-y-3 border-accent bg-accent-soft/30 animate-fade-in mt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-ink uppercase tracking-wider">Edit Profile Details</h4>
              <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn-icon p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-ink-tertiary mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="input text-sm font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-ink-tertiary mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-ink-tertiary mb-1">Unit Address</label>
                {units.length > 0 ? (
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="input text-sm font-bold w-full"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.unit_number}>{u.unit_number}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="input text-sm font-bold"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn-ghost text-xs py-1.5 px-3">
                Cancel
              </button>
              <button type="submit" disabled={isSavingProfile || !editName.trim()} className="btn-primary text-xs py-1.5 px-4">
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {mySpot && (
          <button
            onClick={() => setShowRentalModal(true)}
            className="w-full btn-ghost text-xs flex items-center justify-center gap-1.5 border border-dashed border-border rounded-2xl py-2.5"
          >
            <Key className="w-3.5 h-3.5" />
            Make personal carpark available
          </button>
        )}
      </div>



      {/* Admin / Portal access */}
      {isManagementOrAdmin && (
        <div className="card p-3.5 space-y-2.5 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">Privileged Controls</span>
            <span className="text-[10px] text-slate-400 font-mono">PC & Mobile</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/management"
              className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5 border border-blue-500/40 text-blue-200 hover:text-white"
            >
              <Shield className="w-4 h-4 text-info" /> Management (PC)
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5 border border-rose-500/40 text-rose-200 hover:text-white"
              >
                <Sliders className="w-4 h-4 text-danger" /> D1 Studio (PC)
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Registered Vehicles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">My Registered Vehicles</h3>
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </button>
        </div>

        {showAddVehicleModal && (
          <form
            onSubmit={handleAddVehicleSubmit}
            className="card p-4 space-y-3.5 border animate-fade-in"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 20px var(--ambient-glow)',
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                Register New Vehicle Plate
              </h4>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Plate Number *
                </label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. HZZ303"
                  className="w-full py-2 px-3 text-xs font-mono font-bold uppercase text-white rounded-xl focus:outline-none border bg-black/50"
                  style={{ borderColor: 'var(--card-border)' }}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Vehicle Description
                </label>
                <input
                  type="text"
                  value={newMakeModel}
                  onChange={(e) => setNewMakeModel(e.target.value)}
                  placeholder="e.g. Silver Toyota Aqua"
                  className="w-full py-2 px-3 text-xs text-white rounded-xl focus:outline-none border bg-black/50"
                  style={{ borderColor: 'var(--card-border)' }}
                />
              </div>

              {/* Real-time NZ Plate Preview */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                  Plate Preview:
                </span>
                <PlateCard plate={newPlate || 'HZZ303'} size="sm" showScrews={true} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingVehicle || !newPlate.trim()}
                className="py-1.5 px-4 rounded-xl text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-md flex items-center gap-1"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {isAddingVehicle ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        )}

        {unitVehicles.length === 0 ? (
          <div className="card p-5 text-center text-xs text-ink-tertiary">
            No registered vehicles. Tap '+ Add Vehicle' above to register your rego plate.
          </div>
        ) : (
          <div className="space-y-2">
            {unitVehicles.map((vehicle) => (
              <div key={vehicle.id} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <PlateCard plate={vehicle.plate_number} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-ink truncate">{vehicle.make_model_color || 'Vehicle'}</h4>
                    <span className="text-[10px] text-ink-tertiary">{vehicle.unit_number}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveVehicle(vehicle.id, vehicle.plate_number)}
                  className="btn-icon p-2 text-danger hover:bg-danger-soft"
                  title="Remove Vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Setup, PWA Install & Expiry Alerts Guide */}
      <div className="card p-4 space-y-2.5 shadow-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 shadow-xs"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">App Setup & Notification Alerts</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Replay guided setup or enable free lock-screen expiry alerts
              </p>
            </div>
          </div>
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="py-1.5 px-3 rounded-xl border text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-[0.98] shrink-0"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderColor: 'var(--card-border)',
              }}
            >
              Open Setup
            </button>
          )}
        </div>
      </div>

      {/* Theme / Palette Selection (Named Custom Palettes) */}
      <div className="card p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Color Palette</h3>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Select your preferred app styling theme</p>
          </div>
          <span
            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderColor: 'var(--card-border)',
              color: 'var(--accent-secondary)',
            }}
          >
            {paletteConfig.name}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {(Object.values(PALETTES) as typeof PALETTES[keyof typeof PALETTES][]).map((p) => {
            const isSelected = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                className="w-full p-2.5 rounded-2xl border text-left transition-all relative flex items-center justify-between gap-3"
                style={{
                  backgroundColor: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                  borderColor: isSelected ? 'var(--accent-secondary)' : 'var(--card-border)',
                  boxShadow: isSelected ? '0 0 16px var(--ambient-glow)' : 'none',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                  </div>
                  <span
                    className="text-[10px] font-medium truncate block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {p.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Color Swatches */}
                  <div className="flex items-center gap-1">
                    {p.swatches.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {isSelected ? (
                    <div
                      className="w-5 h-5 rounded-full text-slate-950 flex items-center justify-center shadow-xs"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border"
                      style={{ borderColor: 'var(--card-border)' }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="btn-danger w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      {showRentalModal && <RentalModal isOpen={showRentalModal} onClose={() => setShowRentalModal(false)} />}
    </div>
  );
};
