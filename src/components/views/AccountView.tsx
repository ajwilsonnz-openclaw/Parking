'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { User, Car, ShieldAlert, Phone, Mail, Home, Key, CheckCircle2 } from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

interface AccountViewProps {
  onOpenRental?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenRental }) => {
  const { currentUser, vehicles, demerits, carparks, config } = useApp();

  const unitNumber = currentUser?.unit_number || 'Unit 402';
  const unitVehicles = vehicles.filter((v) => v.unit_number === unitNumber || unitNumber === 'Building Office');
  const unitDemerits = demerits.filter((d) => d.unit_number === unitNumber);
  const totalDemeritPoints = unitDemerits.reduce((sum, d) => sum + d.demerit_points, 0);

  const assignedSpotCount = carparks.filter((c) => c.owner_unit_number === unitNumber).length || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-sky-500">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-sky-500/20">
            {currentUser?.name.charAt(0) || 'A'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{currentUser?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-sky-400" /> {unitNumber}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-sky-400" /> {currentUser?.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-sky-400" /> {currentUser?.phone}</span>
            </p>
          </div>
        </div>

        {/* Account Quick Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {onOpenRental && (
            <button
              onClick={onOpenRental}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
            >
              <Key className="w-4 h-4" /> Rent Out My Spot
            </button>
          )}

          <div className="glass-panel px-3 py-1.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demerits</span>
            <span className={`text-sm font-extrabold ${totalDemeritPoints > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalDemeritPoints} Pts
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Registered Vehicles & Demerit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Unit Vehicles */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400" />
              <span>Registered Unit Vehicles</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {unitVehicles.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <PlateCard plate={v.plate_number} size="sm" />
                    {v.is_primary && (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5 font-medium">{v.make_model_color}</div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Demerit & Violation Ledger */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Demerit & Violation Ledger</span>
            </h3>
            <span className="text-[10px] text-slate-400">Threshold: {config.demerit_fine_threshold} Pts ($50)</span>
          </div>

          {unitDemerits.length === 0 ? (
            <div className="py-6 text-center bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
              <h4 className="text-xs font-bold text-emerald-300">Clean Compliance Record</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero demerits issued for {unitNumber}.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {unitDemerits.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/40">
                        +{d.demerit_points} Demerit Pts
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{d.spot_number}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{d.description}</p>
                  </div>

                  {d.fine_amount > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40 block">
                        ${d.fine_amount} Fine
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
