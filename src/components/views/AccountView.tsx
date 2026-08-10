'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  User, Award, ChevronRight, Smartphone, Moon, Sun, Monitor, LogOut, Shield, Sliders, Trash2, Users, Key, Plus, Car, Check, X,
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
  const { currentUser, vehicles, demerits, carparks, logout, savedGuests, removeSavedGuest, addVehicle, removeVehicle } = useApp();
  const { theme, setTheme } = useTheme();
  const { canInstall, isInstalled, isIos, install } = useInstallPrompt();
  const { signOut } = useAuth();
  const [showRentalModal, setShowRentalModal] = useState(false);

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

      {/* Contact */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="icon-tile w-10 h-10"><User className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary block">Resident Account</span>
            <span className="text-sm font-bold text-ink truncate block">{unitNumber} · {currentUser?.phone || 'No phone set'}</span>
            <span className="text-[11px] text-ink-secondary truncate block">{currentUser?.email}</span>
          </div>
        </div>
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
          unitVehicles.map((v) => (
            <div key={v.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PlateCard plate={v.plate_number} size="sm" />
                <span className="text-xs text-ink-secondary block mt-1.5 font-medium truncate">{v.make_model_color || 'Resident Vehicle'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-success text-[10px]">Registered</span>
                <button
                  onClick={() => handleRemoveVehicle(v.id, v.plate_number)}
                  className="btn-icon p-1.5 text-danger hover:bg-danger-soft"
                  title="Remove vehicle"
                  aria-label="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Saved regular guests */}
      <Section title="Saved Regular Visitors">
        {savedGuests.length === 0 ? (
          <div className="card p-4 text-xs text-ink-tertiary text-center">
            When you book a visitor, tick 'Save as regular visitor' to add them here.
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
                    <span className="text-[11px] text-ink-tertiary truncate">· {g.make_model_color}</span>
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

      {/* Demerit history */}
      <Section title="Demerit History">
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
                <span className="chip chip-warning text-[10px] uppercase">+{d.demerit_points} Pts · {d.spot_number}</span>
                {d.fine_amount > 0 && <span className="chip chip-danger text-[10px]">${d.fine_amount} fine</span>}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">{d.description}</p>
            </div>
          ))
        )}
      </Section>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="w-full btn-secondary py-3 text-danger border-danger/30 hover:bg-danger-soft flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <RentalModal isOpen={showRentalModal} onClose={() => setShowRentalModal(false)} />
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="section-title px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
