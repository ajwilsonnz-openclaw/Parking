'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Shield, AlertTriangle, UserCheck } from 'lucide-react';

export const ManagementView: React.FC = () => {
  const { demerits, issueDemerit, whitelist, addWhitelistedUser } = useApp();

  const [activeTab, setActiveTab] = useState<'demerits' | 'whitelist'>('demerits');
  const [newUnit, setNewUnit] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newSpot, setNewSpot] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  const [wlEmail, setWlEmail] = useState('');
  const [wlName, setWlName] = useState('');
  const [wlUnit, setWlUnit] = useState('');
  const [wlPhone, setWlPhone] = useState('');

  const handleIssueDemerit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit || !newSpot) return;
    issueDemerit(newUnit, newPlate || 'UNKNOWN', newSpot, 'overtime', newDesc || 'Parking Violation', newPoints);
    setNewUnit('');
    setNewPlate('');
    setNewSpot('');
    setNewDesc('');
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlEmail || !wlUnit) return;
    addWhitelistedUser(wlEmail, wlName || 'Resident', wlUnit, wlPhone || '+64 21 000 0000', 'user');
    setWlEmail('');
    setWlName('');
    setWlUnit('');
    setWlPhone('');
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Management Header Card */}
      <div className="app-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
              BUILDING MANAGEMENT PORTAL
            </h2>
            <p className="text-xs text-slate-400">Demerit ledger enforcement & resident whitelist management</p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('demerits')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'demerits' ? 'bg-purple-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            Demerits
          </button>
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'whitelist' ? 'bg-purple-600 text-white shadow' : 'text-slate-600'
            }`}
          >
            Whitelist
          </button>
        </div>
      </div>

      {activeTab === 'demerits' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issue Demerit Form */}
          <div className="app-card p-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>ISSUE COMPLIANCE DEMERIT</span>
            </h3>

            <form onSubmit={handleIssueDemerit} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Unit Number</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Unit 402"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Vehicle Plate</label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="e.g. GHJ125"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Spot Number</label>
                <input
                  type="text"
                  value={newSpot}
                  onChange={(e) => setNewSpot(e.target.value)}
                  placeholder="e.g. V-04"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reason / Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Overstayed 24h limit without extension"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demerit Points</label>
                <input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-all mt-1"
              >
                Issue Demerit Record
              </button>
            </form>
          </div>

          {/* Demerit History List */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pl-1 block">
              RECENT DEMERIT RECORDS
            </span>
            <div className="space-y-2">
              {demerits.map((d) => (
                <div key={d.id} className="app-card p-3.5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{d.unit_number}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Spot {d.spot_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{d.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-600 block">+{d.demerit_points} Pts</span>
                    {d.fine_amount > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 block">${d.fine_amount} Fine</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Whitelist Entry Form */}
          <div className="app-card p-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>ADD AUTHORIZED RESIDENT</span>
            </h3>

            <form onSubmit={handleAddWhitelist} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)}
                  placeholder="resident@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Resident Full Name</label>
                <input
                  type="text"
                  value={wlName}
                  onChange={(e) => setWlName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Unit Number</label>
                <input
                  type="text"
                  value={wlUnit}
                  onChange={(e) => setWlUnit(e.target.value)}
                  placeholder="e.g. Unit 304"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  placeholder="e.g. +64 21 555 0199"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-all mt-1"
              >
                Add Resident Email to Whitelist
              </button>
            </form>
          </div>

          {/* Active Whitelist Roster */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pl-1 block">
              WHITELISTED RESIDENTS
            </span>
            <div className="space-y-2">
              {whitelist.map((w) => (
                <div key={w.id} className="app-card p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{w.name} ({w.unit_number})</span>
                    <span className="text-[11px] text-slate-400">{w.email}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
