'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Sliders, UserPlus, Layers, Sparkles, MapPin } from 'lucide-react';
import { Role } from '@/types';

export const AdminView: React.FC = () => {
  const { config, updateConfig, whitelist, addWhitelistedUser } = useApp();

  // Admin Config Form State
  const [maxVisitorHours, setMaxVisitorHours] = useState<number>(config.max_visitor_hours);
  const [maxResidentHours, setMaxResidentHours] = useState<number>(config.max_resident_excess_hours);
  const [demeritThreshold, setDemeritThreshold] = useState<number>(config.demerit_fine_threshold);
  const [demeritFine, setDemeritFine] = useState<number>(config.demerit_fine_amount);
  const [maxWeeklyRental, setMaxWeeklyRental] = useState<number>(config.max_weekly_rental_price);
  const [complexName, setComplexName] = useState<string>(config.complex_name);
  const [towName, setTowName] = useState<string>(config.tow_agency_name);
  const [towPhone, setTowPhone] = useState<string>(config.tow_agency_phone);

  // Site Layout Config State
  const [totalVisitorParks, setTotalVisitorParks] = useState<number>(config.total_visitor_parks);
  const [spotPrefix, setSpotPrefix] = useState<string>(config.spot_prefix);
  const [areaDivisionsText, setAreaDivisionsText] = useState<string>(config.area_divisions.join(', '));

  // Whitelist Form State
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRole, setNewRole] = useState<Role>('user');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAreas = areaDivisionsText
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    updateConfig({
      max_visitor_hours: maxVisitorHours,
      max_resident_excess_hours: maxResidentHours,
      demerit_fine_threshold: demeritThreshold,
      demerit_fine_amount: demeritFine,
      max_weekly_rental_price: maxWeeklyRental,
      complex_name: complexName,
      tow_agency_name: towName,
      tow_agency_phone: towPhone,
      total_visitor_parks: totalVisitorParks,
      spot_prefix: spotPrefix,
      area_divisions: parsedAreas.length > 0 ? parsedAreas : ['Ground Floor', 'Basement Level 1'],
    });
    alert('Admin configuration & site layout settings updated successfully!');
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newUnit) {
      alert('Email and Unit Number are required.');
      return;
    }
    addWhitelistedUser(newEmail.trim().toLowerCase(), newName || newEmail.split('@')[0], newUnit, newPhone, newRole);
    setNewEmail('');
    setNewName('');
    setNewUnit('');
    setNewPhone('');
    alert(`Added ${newEmail} to login whitelist with ${newRole.toUpperCase()} permissions.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Top Banner */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
            Admin Console
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">Cloudflare Pages (`.pages.dev`) Environment</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1">System Configuration & Layout Builder</h2>
        <p className="text-xs text-slate-400">Manage rules, weekly rental caps, site areas, and user whitelist</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings Variable Controls */}
        <div className="glass-panel p-5">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Global Variable Controls</span>
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Building Complex Name
              </label>
              <input
                type="text"
                value={complexName}
                onChange={(e) => setComplexName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            {/* Site Layout Section */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Site Layout & Spot Configurator
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Total Visitor Parks</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalVisitorParks}
                    onChange={(e) => setTotalVisitorParks(parseInt(e.target.value) || 20)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Spot Naming Prefix</label>
                  <input
                    type="text"
                    value={spotPrefix}
                    onChange={(e) => setSpotPrefix(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Area / Division Names (Comma separated)</label>
                <input
                  type="text"
                  value={areaDivisionsText}
                  onChange={(e) => setAreaDivisionsText(e.target.value)}
                  placeholder="e.g. Ground Floor, Basement Level 1 or Front Lot, Back Lot"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Max Visitor Hours (Default: 24h)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={maxVisitorHours}
                  onChange={(e) => setMaxVisitorHours(parseInt(e.target.value) || 24)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Max Resident Excess Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={maxResidentHours}
                  onChange={(e) => setMaxResidentHours(parseInt(e.target.value) || 12)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Max Weekly Rental ($ NZD)
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={maxWeeklyRental}
                  onChange={(e) => setMaxWeeklyRental(parseFloat(e.target.value) || 50)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Demerit Fine ($ NZD)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={demeritFine}
                  onChange={(e) => setDemeritFine(parseFloat(e.target.value) || 50)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all"
            >
              Save Admin Settings & Layout
            </button>
          </form>
        </div>

        {/* User Login Whitelist Manager */}
        <div className="glass-panel p-5">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>User Login Whitelist Manager</span>
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Manually add resident emails to grant access to the PWA
          </p>

          <form onSubmit={handleAddWhitelist} className="space-y-2.5 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="resident@email.com"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
              <input
                type="text"
                required
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Unit Number (e.g. Unit 402)"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Resident Name"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+64 21 000 0000"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
              >
                <option value="user">Resident</option>
                <option value="management">Management</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
            >
              + Provision & Whitelist Email
            </button>
          </form>

          {/* Active Whitelist Table */}
          <div className="max-h-[180px] overflow-y-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-2.5">Email</th>
                  <th className="py-2 px-2.5">Unit</th>
                  <th className="py-2 px-2.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {whitelist.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/60">
                    <td className="py-1.5 px-2.5 text-white font-medium truncate max-w-[140px]">{w.email}</td>
                    <td className="py-1.5 px-2.5 text-slate-300">{w.unit_number}</td>
                    <td className="py-1.5 px-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] uppercase font-bold text-sky-400">
                        {w.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
