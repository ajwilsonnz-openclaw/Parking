'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Shield, AlertTriangle, UserCheck, ArrowLeft, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ManagementViewProps {
  onBack?: () => void;
}

export const ManagementView: React.FC<ManagementViewProps> = ({ onBack }) => {
  const { demerits, issueDemerit, whitelist, addWhitelistedUser, removeWhitelistedUser, sessions, bootRequest, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'demerits' | 'whitelist' | 'active_sessions'>('demerits');
  const [newUnit, setNewUnit] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newSpot, setNewSpot] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  const [wlEmail, setWlEmail] = useState('');
  const [wlName, setWlName] = useState('');
  const [wlUnit, setWlUnit] = useState('');
  const [wlPhone, setWlPhone] = useState('');

  const activeSessions = sessions.filter((s) => s.is_active);
  const residentExcessSessions = activeSessions.filter((s) => s.session_type === 'resident_excess');

  const handleIssueDemerit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit || !newSpot) return;
    const res = await issueDemerit(newUnit, newPlate || 'UNKNOWN', newSpot, 'overtime', newDesc || 'Parking violation', newPoints);
    setNewUnit('');
    setNewPlate('');
    setNewSpot('');
    setNewDesc('');
    alert(res.triggered_fine ? `Demerit issued. $${res.fine_amount} fine triggered automatically.` : 'Demerit issued.');
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlEmail || !wlUnit) return;
    await addWhitelistedUser(wlEmail, wlName || 'Resident', wlUnit, wlPhone || '+64 21 000 0000', 'user');
    setWlEmail('');
    setWlName('');
    setWlUnit('');
    setWlPhone('');
    alert(`Invited ${wlEmail}. They'll be emailed a login link when they first sign in.`);
  };

  const handleRemoveWhitelist = async (id: string) => {
    if (!confirm('Remove this email from the whitelist? They will not be able to sign in again.')) return;
    await removeWhitelistedUser(id);
  };

  const handleBootRequest = async (sessionId: string) => {
    if (!confirm('Flag this resident overflow session to vacate?')) return;
    await bootRequest(sessionId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="card p-5 flex items-start gap-3">
        {onBack && (
          <button onClick={onBack} className="btn-icon p-2 shrink-0" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="icon-tile w-10 h-10 bg-info-soft text-info">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-ink tracking-tight font-display">Management Portal</h2>
              <p className="text-xs text-ink-secondary mt-0.5">Demerits, whitelisting, and spot enforcement.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="card p-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
        <TabBtn active={activeTab === 'demerits'} onClick={() => setActiveTab('demerits')} label="Demerits" count={demerits.length} />
        <TabBtn active={activeTab === 'whitelist'} onClick={() => setActiveTab('whitelist')} label="Approved Residents" count={whitelist.length} />
        <TabBtn active={activeTab === 'active_sessions'} onClick={() => setActiveTab('active_sessions')} label="Sessions" count={activeSessions.length} />
      </div>

      {/* Demerits tab */}
      {activeTab === 'demerits' && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Issue Compliance Demerit
            </h3>

            <form onSubmit={handleIssueDemerit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Unit number" value={newUnit} onChange={setNewUnit} placeholder="e.g. Unit 8" required />
                <Field label="Vehicle plate" value={newPlate} onChange={setNewPlate} placeholder="e.g. PQR334" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Spot number" value={newSpot} onChange={setNewSpot} placeholder="e.g. V05" required />
                <div>
                  <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                    Demerit points
                  </label>
                  <input type="number" min={1} max={10} value={newPoints} onChange={(e) => setNewPoints(parseInt(e.target.value) || 1)}
                    className="input font-mono font-bold text-center" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                  Reason / description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="input text-sm resize-none"
                  placeholder="e.g. Overstayed 24-hour visitor limit without extension."
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Issue demerit
              </button>
            </form>
          </div>

          <Section title={`Recent demerits (${demerits.length})`}>
            {demerits.length === 0 ? (
              <EmptyState icon={<UserCheck className="w-8 h-8 text-success" />} title="No demerits" body="This building has a clean compliance record." />
            ) : (
              demerits.map((d) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="card p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning-soft text-warning flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-ink">{d.unit_number}</span>
                      <span className="chip chip-warning">+{d.demerit_points}p</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-snug mt-0.5">{d.description}</p>
                    <div className="text-[10px] text-ink-tertiary mt-1 flex items-center gap-2">
                      <span>{d.vehicle_plate} • {d.spot_number}</span>
                      <span className="chip chip-accent text-[9px]">{d.violation_type}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </Section>
        </div>
      )}

      {/* Whitelist tab */}
      {activeTab === 'whitelist' && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent" />
              Register resident email
            </h3>

            <form onSubmit={handleAddWhitelist} className="space-y-3">
              <Field label="Email" value={wlEmail} onChange={setWlEmail} placeholder="resident@example.com" type="email" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name" value={wlName} onChange={setWlName} placeholder="e.g. Sarah Jenkins" />
                <Field label="Unit number" value={wlUnit} onChange={setWlUnit} placeholder="e.g. Unit 12" required />
              </div>
              <Field label="Phone (optional)" value={wlPhone} onChange={setWlPhone} placeholder="+64 21 555 0000" />

              <button type="submit" className="btn-primary w-full py-3">
                Register resident
              </button>
            </form>
          </div>

          <Section title={`Approved residents (${whitelist.length})`}>
            {whitelist.length === 0 ? (
              <EmptyState icon={<Users className="w-8 h-8 text-ink-tertiary" />} title="No registered residents" body="Add resident emails above to authorize sign-ins." />
            ) : (
              whitelist.map((w) => (
                <div key={w.id} className="card p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-ink truncate">{w.name}</div>
                    <div className="text-[11px] text-ink-secondary truncate">{w.email} • {w.unit_number}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="chip chip-accent text-[10px]">{w.role}</span>
                    <button
                      onClick={() => handleRemoveWhitelist(w.id)}
                      className="btn-icon p-1.5 text-danger hover:bg-danger-soft"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>
        </div>
      )}

      {/* Active sessions tab (boot flow) */}
      {activeTab === 'active_sessions' && (
        <Section title={`Active parking sessions (${activeSessions.length})`}>
          {residentExcessSessions.length === 0 ? (
            <EmptyState icon={<Car className="w-8 h-8 text-success" />} title="No resident overflow activity" body="All visitor spots are genuinely occupied by visitors." />
          ) : (
            <div className="space-y-2.5">
              {residentExcessSessions.map((s) => (
                <div key={s.id} className="card p-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-ink flex items-center gap-2">
                      <span className="font-mono">{s.spot_number}</span>
                      <span className="chip chip-warning">Resident</span>
                    </div>
                    <div className="text-xs text-ink-secondary mt-0.5">
                      {s.unit_number} • Plate <span className="font-mono">{s.vehicle_plate}</span>
                    </div>
                    <div className="text-[10px] text-ink-tertiary mt-1">
                      Expected end: {new Date(s.expected_end_time).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBootRequest(s.id)}
                    disabled={s.boot_requested}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      s.boot_requested
                        ? 'bg-bg-surface text-ink-tertiary cursor-not-allowed'
                        : 'bg-danger-soft text-danger hover:bg-danger hover:text-white'
                    }`}
                  >
                    {s.boot_requested ? 'Vacate requested' : 'Request vacate'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
};

function TabBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        active ? 'text-accent bg-accent-soft shadow-sm' : 'text-ink-tertiary hover:text-ink'
      }`}
    >
      <span>{label}</span>
      {count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white font-mono">{count}</span>}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
        {label}{required && ' *'}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="input text-sm"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="section-title px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-6 text-center">
      <div className="mx-auto w-10 h-10 rounded-2xl bg-bg-surface flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-sm font-bold text-ink">{title}</div>
      <p className="text-xs text-ink-tertiary mt-0.5 max-w-[240px] mx-auto">{body}</p>
    </div>
  );
}

function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

function Car(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H12c-.6 0-1-.4-1-1V1.9C1 1.7.4 1 0 1s0 .4 0 1v3c0 .6.4 1 1 1h.2c.1.6.3 1.1.5 1.6L2.3 17c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-1c.6 0 1-.4 1-1"/>
      <path d="M9 17h6"/>
    </svg>
  );
}
