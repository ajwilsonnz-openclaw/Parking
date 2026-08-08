'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import {
  BarChart3,
  PhoneCall,
  Send,
  Truck,
  ShieldAlert,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  Copy,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { PlateCard } from '@/components/ui/PlateCard';

export const ManagementView: React.FC = () => {
  const {
    sessions,
    demerits,
    config,
    sendDirectAlert,
    issueDemerit,
    longestResidentSessionToBoot,
    vehicles,
    whitelist,
  } = useApp();

  const [selectedUnit, setSelectedUnit] = useState<string>('Unit 108');
  const [alertMessage, setAlertMessage] = useState<string>('Please move your vehicle from visitor park V-05.');
  const [alertChannel, setAlertChannel] = useState<'in_app' | 'sms' | 'call'>('in_app');
  const [showTowModal, setShowTowModal] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Management Statistics
  const activeSessions = sessions.filter((s) => s.is_active);

  // Group dwell times by rego
  const regoDwellStats = sessions.reduce((acc, sess) => {
    const start = new Date(sess.start_time).getTime();
    const end = sess.end_time ? new Date(sess.end_time).getTime() : new Date().getTime();
    const hours = Math.round(((end - start) / (1000 * 3600)) * 10) / 10;

    if (!acc[sess.vehicle_plate]) {
      acc[sess.vehicle_plate] = { plate: sess.vehicle_plate, unit: sess.unit_number, totalHours: 0, count: 0 };
    }
    acc[sess.vehicle_plate].totalHours += hours;
    acc[sess.vehicle_plate].count += 1;
    return acc;
  }, {} as Record<string, { plate: string; unit: string; totalHours: number; count: number }>);

  const topRegos = Object.values(regoDwellStats).sort((a, b) => b.totalHours - a.totalHours);

  // Tow dispatch summary template
  const targetTowSession = longestResidentSessionToBoot || activeSessions[0];
  const towDispatchSummary = targetTowSession
    ? `TOWING DISPATCH REQUEST - ${config.complex_name}\nSpot: ${targetTowSession.spot_number}\nVehicle Plate: ${targetTowSession.vehicle_plate}\nUnit: ${targetTowSession.unit_number}\nReason: Exceeded visitor parking duration / priority vacate failure.\nContact: ${config.tow_agency_name} (${config.tow_agency_phone})`
    : 'No active overstay vehicle flagged.';

  const handleCopyTowSummary = () => {
    navigator.clipboard.writeText(towDispatchSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    sendDirectAlert(selectedUnit, alertMessage, alertChannel);
    alert(`Alert dispatched to ${selectedUnit} via ${alertChannel.toUpperCase()}!`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Management Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
              Management Portal
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">{config.complex_name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Car Park Operations & Analytics</h2>
          <p className="text-xs text-slate-400">Monitor dwell times, enforce bodycorp rules, and direct resident alerts</p>
        </div>

        {/* Towing Agency Quick Action Button */}
        <button
          onClick={() => setShowTowModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2.5 active:scale-95"
        >
          <Truck className="w-5 h-5" />
          <span>Call Towing Agency</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Total Vehicle Dwell Records</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{Object.keys(regoDwellStats).length} Regos</div>
          <p className="text-xs text-slate-400 mt-1">Tracked across visitor parks</p>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Demerits & Fines Issued</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{demerits.length} Notices</div>
          <p className="text-xs text-slate-400 mt-1">
            ${demerits.reduce((sum, d) => sum + d.fine_amount, 0)} Total Fines
          </p>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Active Whitelisted Units</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">{whitelist.length} Approved</div>
          <p className="text-xs text-slate-400 mt-1">Authorized for app login</p>
        </div>
      </div>

      {/* Main Grid: Dwell Time Statistics & Direct Alert Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dwell Time Statistics Table */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Vehicle Dwell & Visitor Usage Leaderboard</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Sessions</th>
                  <th className="py-2.5 px-3 text-right">Total Dwell Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topRegos.slice(0, 6).map((stat) => (
                  <tr key={stat.plate} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <PlateCard plate={stat.plate} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{stat.unit}</td>
                    <td className="py-3 px-3 text-slate-300">{stat.count} bookings</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-400">
                      {stat.totalHours} Hours
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Direct Resident Alert Sender */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-400" />
            <span>Direct Resident Alert Dispatcher</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Send instant alerts, prefilled SMS messages, or direct phone calls to residents
          </p>

          <form onSubmit={handleSendAlert} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Select Target Resident Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                {whitelist.map((w) => (
                  <option key={w.id} value={w.unit_number}>
                    {w.unit_number} — {w.name} ({w.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Communication Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertChannel('in_app')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    alertChannel === 'in_app'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  In-App Alert
                </button>
                <button
                  type="button"
                  onClick={() => setAlertChannel('sms')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    alertChannel === 'sms'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Text SMS
                </button>
                <button
                  type="button"
                  onClick={() => setAlertChannel('call')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    alertChannel === 'call'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Phone Call
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-3 pt-1">
              {alertChannel === 'sms' ? (
                <a
                  href={`sms:${whitelist.find((w) => w.unit_number === selectedUnit)?.phone || ''}?body=${encodeURIComponent(alertMessage)}`}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Open Native Messaging App
                </a>
              ) : alertChannel === 'call' ? (
                <a
                  href={`tel:${whitelist.find((w) => w.unit_number === selectedUnit)?.phone || ''}`}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" /> Trigger Direct Phone Call
                </a>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send In-App Push Notification
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Management Smart Suggestions Box */}
      <div className="glass-panel p-6 border-l-4 border-l-purple-500">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Management Automated Insights & Recommendations</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
          <li>
            <strong>Unit 108</strong> has logged 3 resident excess overstays this week. Consider issuing a $50 BodyCorp fine warning.
          </li>
          <li>
            Peak visitor hours occur between <strong>6:00 PM - 9:30 PM</strong>. Recommend enforcement sweeps during this window.
          </li>
          <li>
            Towing agency contact line: <strong>{config.tow_agency_name} ({config.tow_agency_phone})</strong> is saved for quick dispatch.
          </li>
        </ul>
      </div>

      {/* Towing Agency Action Modal */}
      {showTowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-rose-500/50 shadow-2xl relative">
            <button
              onClick={() => setShowTowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Towing Dispatch Center</h3>
                <p className="text-xs text-slate-400">Authorized BodyCorp Enforcement Action</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-4 space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase">Contracted Towing Agency</div>
              <div className="text-base font-extrabold text-white">{config.tow_agency_name}</div>
              <div className="text-sm font-mono text-emerald-400 font-bold">{config.tow_agency_phone}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Dispatch Summary Template</span>
                <button
                  onClick={handleCopyTowSummary}
                  className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedSummary ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-tight">
                {towDispatchSummary}
              </pre>
            </div>

            <div className="flex gap-3">
              <a
                href={`tel:${config.tow_agency_phone}`}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <PhoneCall className="w-4 h-4" /> Call Towing Dispatch Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
