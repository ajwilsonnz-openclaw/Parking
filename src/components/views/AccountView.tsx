'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { User, Car, ShieldAlert, Phone, Mail, Home, Key, LogOut, Award } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

interface AccountViewProps {
  onOpenRental?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenRental }) => {
  const { currentUser, vehicles, demerits, carparks, config, switchRole } = useApp();

  const unitNumber = currentUser?.unit_number || 'Unit 402';
  const unitVehicles = vehicles.filter((v) => v.unit_number === unitNumber || unitNumber === 'Building Office');
  const unitDemerits = demerits.filter((d) => d.unit_number === unitNumber);
  const totalDemeritPoints = unitDemerits.reduce((sum, d) => sum + d.demerit_points, 0);
  const assignedSpotCount = carparks.filter((c) => c.owner_unit_number === unitNumber).length || 1;

  return (
    <div className="space-y-5 animate-fade-in max-w-xl mx-auto pb-12">
      {/* Profile Header (Matching Screenshot 1 Profile Layout) */}
      <div className="flex flex-col items-center justify-center text-center py-4">
        {/* Rounded Blue Avatar Container (Matching Screenshot 1 Avatar) */}
        <div className="w-20 h-20 rounded-3xl bg-[#0052b4] text-white flex items-center justify-center shadow-md mb-3">
          <User className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentUser?.name}</h2>
        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">
          {currentUser?.role} • {unitNumber}
        </div>
      </div>

      {/* KPI Stats Cards (Matching Screenshot 1 Day OT / Night OT Card Row) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="app-card p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            ASSIGNED PARKS
          </span>
          <span className="text-2xl font-black text-slate-900">{assignedSpotCount}</span>
        </div>

        <div className="app-card p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            DEMERIT POINTS
          </span>
          <span className={`text-2xl font-black ${totalDemeritPoints > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {totalDemeritPoints}
          </span>
        </div>
      </div>

      {/* Profile Information Card (Matching Screenshot 1 Home Station Card) */}
      <div className="app-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              HOME UNIT & CONTACT
            </span>
            <span className="text-sm font-bold text-slate-900">{unitNumber} • {currentUser?.phone}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">{currentUser?.email}</span>
          {onOpenRental && (
            <button
              onClick={onOpenRental}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Rent My Spot
            </button>
          )}
        </div>
      </div>

      {/* Registered Unit Vehicles Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pl-1 block">
          REGISTERED VEHICLES
        </span>
        <div className="space-y-2">
          {unitVehicles.map((v) => (
            <div key={v.id} className="app-card p-3.5 flex items-center justify-between">
              <div>
                <PlateCard plate={v.plate_number} size="sm" />
                <span className="text-xs text-slate-600 block mt-1 font-medium">{v.make_model_color}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Approved
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Demerit Ledger Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pl-1 block">
          DEMERIT HISTORY
        </span>
        {unitDemerits.length === 0 ? (
          <div className="app-card p-4 text-center">
            <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-700 block">Clean Compliance Record</span>
            <span className="text-[11px] text-slate-400">Zero demerits issued</span>
          </div>
        ) : (
          unitDemerits.map((d) => (
            <div key={d.id} className="app-card p-3.5 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                  +{d.demerit_points} Pts • {d.spot_number}
                </span>
                <p className="text-xs text-slate-600 mt-1">{d.description}</p>
              </div>
              {d.fine_amount > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                  ${d.fine_amount} Fine
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sign Out Button (Matching Screenshot 1 SIGN OUT Button) */}
      <div className="pt-2">
        <button
          onClick={() => switchRole('user')}
          className="w-full py-3 rounded-2xl app-card text-center font-extrabold text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};
