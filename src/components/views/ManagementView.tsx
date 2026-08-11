'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Shield, AlertTriangle, UserCheck, ArrowLeft, Users, Plus, Building2, Minus, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { WhitelistEntry } from '@/types';

interface ManagementViewProps {
  onBack?: () => void;
}

interface UnitRecord {
  id: string;
  unit_number: string;
  assigned_parks: number;
  notes?: string;
}

export const ManagementView: React.FC<ManagementViewProps> = ({ onBack }) => {
  const { demerits, issueDemerit, whitelist, addWhitelistedUser, removeWhitelistedUser, sessions, bootRequest, units, refetch, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'units' | 'whitelist' | 'demerits' | 'active_sessions'>('whitelist');

  // Units state
  const [newUnitNum, setNewUnitNum] = useState('');
  const [newUnitParks, setNewUnitParks] = useState(1);
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  // Edit Unit state
  const [editingUnit, setEditingUnit] = useState<UnitRecord | null>(null);
  const [editUnitNum, setEditUnitNum] = useState('');
  const [editUnitParks, setEditUnitParks] = useState(1);

  // Whitelist state
  const [wlEmail, setWlEmail] = useState('');
  const [wlName, setWlName] = useState('');
  const [wlUnit, setWlUnit] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlRole, setWlRole] = useState<'user' | 'management' | 'admin'>('user');

  // Edit Whitelist state
  const [editingWl, setEditingWl] = useState<WhitelistEntry | null>(null);
  const [editWlEmail, setEditWlEmail] = useState('');
  const [editWlName, setEditWlName] = useState('');
  const [editWlUnit, setEditWlUnit] = useState('');
  const [editWlPhone, setEditWlPhone] = useState('');
  const [editWlRole, setEditWlRole] = useState<'user' | 'management' | 'admin'>('user');

  // Demerits state
  const [newUnit, setNewUnit] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newSpot, setNewSpot] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  const activeSessions = sessions.filter((s) => s.is_active);
  const residentExcessSessions = activeSessions.filter((s) => s.session_type === 'resident_excess');

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitNum.trim()) return;
    setIsSavingUnit(true);
    try {
      await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_number: newUnitNum.trim(), assigned_parks: newUnitParks }),
      });
      setNewUnitNum('');
      setNewUnitParks(1);
      refetch();
    } catch {} finally {
      setIsSavingUnit(false);
    }
  };

  const handleSaveEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editUnitNum.trim()) return;
    try {
      await fetch('/api/admin/units', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUnit.id, unit_number: editUnitNum.trim(), assigned_parks: editUnitParks }),
      });
      setEditingUnit(null);
      refetch();
    } catch {}
  };

  const handleDeleteUnit = async (id: string, unitNum: string) => {
    if (!confirm(`Delete unit ${unitNum}?`)) return;
    await fetch(`/api/admin/units?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    refetch();
  };

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
    await addWhitelistedUser(wlEmail, wlName || 'Resident', wlUnit, wlPhone || '', wlRole, 1);
    setWlEmail('');
    setWlName('');
    setWlUnit('');
    setWlPhone('');
    setWlRole('user');
    alert(`Authorised ${wlEmail} for ${wlUnit} as ${wlRole}. Clerk email invite sent!`);
  };

  const handleSaveEditWl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWl || !editWlEmail || !editWlUnit) return;
    await addWhitelistedUser(editWlEmail, editWlName, editWlUnit, editWlPhone, editWlRole, 1);
    setEditingWl(null);
    alert(`Updated details for ${editWlEmail}.`);
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
              <p className="text-xs text-ink-secondary mt-0.5">Units registry, resident authorization, and compliance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="card p-1 grid grid-cols-4 gap-1">
        <TabBtn active={activeTab === 'whitelist'} onClick={() => setActiveTab('whitelist')} label="Approved Residents" count={whitelist.length} />
        <TabBtn active={activeTab === 'units'} onClick={() => setActiveTab('units')} label="Building Units" count={units.length} />
        <TabBtn active={activeTab === 'demerits'} onClick={() => setActiveTab('demerits')} label="Demerits" count={demerits.length} />
        <TabBtn active={activeTab === 'active_sessions'} onClick={() => setActiveTab('active_sessions')} label="Sessions" count={activeSessions.length} />
      </div>

      {/* Units registry tab */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {editingUnit ? (
            <div className="card p-4 space-y-3 border-accent">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-accent" />
                Edit Building Unit ({editingUnit.unit_number})
              </h3>
              <form onSubmit={handleSaveEditUnit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Unit Address / Number" value={editUnitNum} onChange={setEditUnitNum} required />
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                      Assigned Parks
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setEditUnitParks(Math.max(1, editUnitParks - 1))} className="btn-icon p-2 border">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-base font-black px-4">{editUnitParks}</span>
                      <button type="button" onClick={() => setEditUnitParks(editUnitParks + 1)} className="btn-icon p-2 border">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">Save Unit Changes</button>
                  <button type="button" onClick={() => setEditingUnit(null)} className="btn-secondary py-2.5 text-xs">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-4 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-accent" />
                Register Building Unit
              </h3>

              <form onSubmit={handleAddUnit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Unit Address / Number" value={newUnitNum} onChange={setNewUnitNum} placeholder="e.g. Unit 101" required />
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                      Assigned Parks
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUnitParks(Math.max(1, newUnitParks - 1))}
                        className="btn-icon p-2 bg-bg-surface hover:bg-border border border-border"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-base font-black px-4 text-ink">{newUnitParks}</span>
                      <button
                        type="button"
                        onClick={() => setNewUnitParks(newUnitParks + 1)}
                        className="btn-icon p-2 bg-bg-surface hover:bg-border border border-border"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSavingUnit || !newUnitNum.trim()} className="btn-primary w-full py-3">
                  {isSavingUnit ? 'Saving Unit...' : 'Add Building Unit'}
                </button>
              </form>
            </div>
          )}

          <Section title={`Registered Building Units (${units.length})`}>
            {units.length === 0 ? (
              <EmptyState icon={<Building2 className="w-8 h-8 text-ink-tertiary" />} title="No units registered" body="Add building units above to set allocated parking quotas." />
            ) : (
              units.map((u) => (
                <div key={u.id} className="card p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-ink">{u.unit_number}</div>
                    <div className="text-xs text-accent font-bold mt-0.5">{u.assigned_parks} Assigned Park{u.assigned_parks > 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingUnit(u);
                        setEditUnitNum(u.unit_number);
                        setEditUnitParks(u.assigned_parks);
                      }}
                      className="btn-icon p-2 text-accent hover:bg-accent-soft"
                      title="Edit unit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUnit(u.id, u.unit_number)} className="btn-icon p-2 text-danger hover:bg-danger-soft" title="Delete unit">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>
        </div>
      )}

      {/* Whitelist tab */}
      {activeTab === 'whitelist' && (
        <div className="space-y-4">
          {editingWl ? (
            <div className="card p-4 space-y-3 border-accent">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-accent" />
                Edit Resident ({editingWl.email})
              </h3>
              <form onSubmit={handleSaveEditWl} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name" value={editWlName} onChange={setEditWlName} required />
                  <Field label="Phone" value={editWlPhone} onChange={setEditWlPhone} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">Unit Address</label>
                    <select value={editWlUnit} onChange={(e) => setEditWlUnit(e.target.value)} className="input text-sm font-bold w-full" required>
                      {units.map((u) => (
                        <option key={u.id} value={u.unit_number}>{u.unit_number}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">Role</label>
                    <select value={editWlRole} onChange={(e) => setEditWlRole(e.target.value as any)} className="input text-sm font-bold w-full">
                      <option value="user">Resident (User)</option>
                      <option value="management">Management</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">Save Resident Changes</button>
                  <button type="button" onClick={() => setEditingWl(null)} className="btn-secondary py-2.5 text-xs">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-4 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-accent" />
                Authorise Resident Email
              </h3>

              <form onSubmit={handleAddWhitelist} className="space-y-3">
                <Field label="Email address" value={wlEmail} onChange={setWlEmail} placeholder="resident@example.com" type="email" required />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full name" value={wlName} onChange={setWlName} placeholder="e.g. Sarah Jenkins" />
                  <Field label="Phone (optional)" value={wlPhone} onChange={setWlPhone} placeholder="+64 21 555 0000" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                      Select Unit Address
                    </label>
                    {units.length > 0 ? (
                      <select
                        value={wlUnit}
                        onChange={(e) => setWlUnit(e.target.value)}
                        className="input text-sm font-bold w-full"
                        required
                      >
                        <option value="">-- Choose Unit Address --</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.unit_number}>
                            {u.unit_number} ({u.assigned_parks} Assigned Park{u.assigned_parks > 1 ? 's' : ''})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="card p-3 bg-warning-soft border-warning/30 text-warning text-xs font-medium">
                        ⚠️ No building units registered yet. Please create a building unit under the <strong>Building Units</strong> tab above before authorising residents.
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
                      Assigned Role
                    </label>
                    <select
                      value={wlRole}
                      onChange={(e) => setWlRole(e.target.value as any)}
                      className="input text-sm font-bold w-full"
                    >
                      <option value="user">Resident (User)</option>
                      <option value="management">Management</option>
                      {currentUser?.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={!units.length || !wlUnit} className="btn-primary w-full py-3">
                  Authorise Resident Email
                </button>
              </form>
            </div>
          )}

          <Section title={`Approved Residents (${whitelist.length})`}>
            {whitelist.length === 0 ? (
              <EmptyState icon={<Users className="w-8 h-8 text-ink-tertiary" />} title="No registered residents" body="Add resident emails above to authorise sign-ins." />
            ) : (
              whitelist.map((w) => (
                <div key={w.id} className="card p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-ink truncate">{w.name}</div>
                    <div className="text-[11px] text-ink-secondary truncate">{w.email} • {w.unit_number}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="chip chip-accent text-[10px]">{w.role}</span>
                    <button
                      onClick={() => {
                        setEditingWl(w);
                        setEditWlEmail(w.email);
                        setEditWlName(w.name);
                        setEditWlUnit(w.unit_number);
                        setEditWlPhone(w.phone || '');
                        setEditWlRole(w.role || 'user');
                      }}
                      className="btn-icon p-1.5 text-accent hover:bg-accent-soft"
                      title="Edit Resident"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveWhitelist(w.id)}
                      className="btn-icon p-1.5 text-danger hover:bg-danger-soft"
                      title="Remove Resident"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </Section>
        </div>
      )}

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

      {/* Active sessions tab */}
      {activeTab === 'active_sessions' && (
        <Section title={`Active parking sessions (${activeSessions.length})`}>
          {residentExcessSessions.length === 0 ? (
            <EmptyState icon={<Shield className="w-8 h-8 text-success" />} title="No resident overflow activity" body="All visitor spots are genuinely occupied by visitors." />
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
      className={`py-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
        active ? 'text-accent bg-accent-soft shadow-sm' : 'text-ink-tertiary hover:text-ink'
      }`}
    >
      <span>{label}</span>
      <span className="text-[9px] font-mono opacity-80">({count})</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="section-title px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-8 text-center space-y-2">
      <div className="mx-auto flex justify-center mb-1">{icon}</div>
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      <p className="text-xs text-ink-tertiary max-w-xs mx-auto">{body}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-tertiary uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input text-sm"
      />
    </div>
  );
}
