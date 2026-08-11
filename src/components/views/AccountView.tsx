'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  User, Award, ChevronRight, Smartphone, Moon, Sun, Monitor, LogOut, Shield, Sliders, Trash2, Users, Key, Plus, Car, Check, X, Edit2,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';
import { useAuth } from '@clerk/nextjs';
import { RentalModal } from '@/components/parking/RentalModal';

interface AccountViewProps {
  onOpenManagement?: () => void;
  onOpenAdmin?: () => void;
  onOpenPushGuide?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenManagement, onOpenAdmin, onOpenPushGuide }) => {
  const { currentUser, vehicles, demerits, carparks, logout, savedGuests, removeSavedGuest, addVehicle, removeVehicle, units, refetch } = useApp();
  const { theme, setTheme } = useTheme();
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

  const unitNumber = currentUser?.unit_number || 'Unit 402';
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
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0066ff] to-[#0052cc] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-ink tracking-tight font-display">{currentUser?.name}</h2>
        <div className="text-xs font-bold text-accent uppercase tracking-widest mt-0.5">
          {currentUser?.role} · {unitNumber}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-tertiary block mb-1">Unit</span>
          <span className="text-xl font-black text-ink">{currentUser?.unit_number?.replace(/^Unit\s+/i, '') || '-'}</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-tertiary block mb-1">Assigned Parks</span>
          <span className="text-xl font-black text-accent">{assignedParksCount}</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-tertiary block mb-1">Demerits</span>
          <span className={`text-xl font-black ${totalDemeritPoints > 0 ? 'text-warning' : 'text-success'}`}>{totalDemeritPoints}</span>
        </div>
      </div>

      {/* Contact & Edit Profile */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="icon-tile w-10 h-10 shrink-0"><User className="w-5 h-5" /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">Resident Account</span>
              <span className="text-sm font-bold text-ink truncate block">{unitNumber} · {currentUser?.phone || 'No phone set'}</span>
              <span className="text-[11px] text-ink-secondary truncate block">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={handleOpenEditProfile}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
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
        <div className="card p-3.5 space-y-2 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">Privileged Controls</span>
          <div className="grid grid-cols-2 gap-2">
            {onOpenManagement && (
              <button onClick={onOpenManagement} className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Shield className="w-4 h-4 text-info" /> Management
              </button>
            )}
            {isAdmin && onOpenAdmin && (
              <button onClick={onOpenAdmin} className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Sliders className="w-4 h-4 text-danger" /> Admin Controls
              </button>
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
          <form onSubmit={handleAddVehicleSubmit} className="card p-4 space-y-3 border-accent/40 bg-accent-soft/30 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-accent" /> Register new vehicle plate
              </h4>
              <button type="button" onClick={() => setShowAddVehicleModal(false)} className="btn-icon p-1 text-ink-tertiary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-ink-tertiary mb-1">Plate Number</label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. GHJ125"
                  className="input font-mono text-center text-sm font-bold uppercase"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-ink-tertiary mb-1">Make / Model / Color</label>
                <input
                  type="text"
                  value={newMakeModel}
                  onChange={(e) => setNewMakeModel(e.target.value)}
                  placeholder="e.g. Toyota Aqua Blue"
                  className="input text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowAddVehicleModal(false)} className="btn-ghost text-xs py-1.5 px-3">
                Cancel
              </button>
              <button type="submit" disabled={isAddingVehicle || !newPlate.trim()} className="btn-primary text-xs py-1.5 px-4">
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

      {/* Theme selection */}
      <div className="card p-4 space-y-3">
        <h3 className="section-title">App Theme</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'light' ? 'bg-accent-soft border-accent text-accent' : 'border-border text-ink-secondary'
            }`}
          >
            <Sun className="w-4 h-4" /> Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'dark' ? 'bg-accent-soft border-accent text-accent' : 'border-border text-ink-secondary'
            }`}
          >
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'system' ? 'bg-accent-soft border-accent text-accent' : 'border-border text-ink-secondary'
            }`}
          >
            <Monitor className="w-4 h-4" /> System
          </button>
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
