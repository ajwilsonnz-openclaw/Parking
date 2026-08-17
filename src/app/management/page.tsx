'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Car,
  AlertTriangle,
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowLeft,
  Search,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { PlateCard } from '@/components/ui/PlateCard';

export default function ManagementPage() {
  const {
    currentUser,
    whitelist,
    sessions,
    carparks,
    demerits,
    units,
    refetch,
    addWhitelistedUser,
    removeWhitelistedUser,
    issueDemerit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'whitelist' | 'sessions' | 'units' | 'demerits'>('whitelist');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Whitelist Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [wlEmail, setWlEmail] = useState<string>('');
  const [wlName, setWlName] = useState<string>('');
  const [wlUnit, setWlUnit] = useState<string>(units[0]?.unit_number || 'Unit 1');
  const [wlPhone, setWlPhone] = useState<string>('');
  const [wlRole, setWlRole] = useState<'user' | 'management' | 'admin'>('user');
  const [wlParks, setWlParks] = useState<number>(units[0]?.assigned_parks || 1);
  const [isSubmittingWl, setIsSubmittingWl] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  React.useEffect(() => {
    if (!wlUnit && units.length > 0) {
      setWlUnit(units[0].unit_number);
      setWlParks(units[0].assigned_parks || 1);
    }
  }, [units, wlUnit]);

  // Demerit Form State
  const [demeritUnit, setDemeritUnit] = useState<string>('');
  const [demeritPlate, setDemeritPlate] = useState<string>('');
  const [demeritSpot, setDemeritSpot] = useState<string>('');
  const [demeritReason, setDemeritReason] = useState<string>('');
  const [isIssuingDemerit, setIsIssuingDemerit] = useState<boolean>(false);

  const activeSessions = sessions.filter((s) => s.is_active);
  const occupiedSpotsCount = activeSessions.length;
  const totalSpots = carparks.length || 23;
  const occupancyPercent = Math.round((occupiedSpotsCount / totalSpots) * 100);

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlEmail.trim() || !wlUnit.trim()) return;

    setIsSubmittingWl(true);
    setSyncNotice(null);

    try {
      await addWhitelistedUser(
        wlEmail.trim().toLowerCase(),
        wlName.trim() || wlEmail.split('@')[0],
        wlUnit.trim(),
        wlPhone.trim(),
        wlRole,
        wlParks
      );

      setSyncNotice(`Added ${wlEmail} and synchronized with Clerk backend allowlist.`);
      setShowAddModal(false);
      setWlEmail('');
      setWlName('');
      setWlUnit('');
      setWlPhone('');
      setWlParks(1);
      setTimeout(() => setSyncNotice(null), 5000);
      refetch();
    } catch (err: any) {
      alert(`Failed to add resident: ${err.message}`);
    } finally {
      setIsSubmittingWl(false);
    }
  };

  const handleCreateDemerit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demeritUnit.trim() || !demeritPlate.trim()) return;
    setIsIssuingDemerit(true);
    try {
      await issueDemerit(
        demeritUnit.trim(),
        demeritPlate.trim().toUpperCase(),
        demeritSpot.trim() || 'V01',
        'overtime',
        demeritReason.trim() || 'Unauthorized Parking / Overstay',
        1
      );
      setDemeritUnit('');
      setDemeritPlate('');
      setDemeritSpot('');
      setDemeritReason('');
      refetch();
    } catch (err: any) {
      alert(`Error issuing demerit: ${err.message}`);
    } finally {
      setIsIssuingDemerit(false);
    }
  };

  const filteredWhitelist = whitelist.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.email.toLowerCase().includes(q) ||
      w.name.toLowerCase().includes(q) ||
      w.unit_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--app-bg,#10151A)] text-slate-100 flex flex-col">
      {/* Top Desktop Navigation Header */}
      <header className="h-16 border-b border-white/10 bg-black/40 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mobile App</span>
          </Link>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h1 className="text-sm font-black text-white">
              Millennium Village Management Dashboard
            </h1>
            <Badge variant="info" className="ml-2">
              Desktop PC
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold block text-white">
              {currentUser?.name || 'Manager'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {currentUser?.role?.toUpperCase()} • {currentUser?.unit_number || 'Unit 5'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {syncNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <Badge variant="success">Clerk Synced</Badge>
          </div>
        )}

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Complex Occupancy
              </span>
              <CardTitle className="text-2xl font-mono mt-1 text-white">
                {occupancyPercent}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">
                {occupiedSpotsCount} of {totalSpots} bays occupied
              </p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Guests & Visitors
              </span>
              <CardTitle className="text-2xl font-mono mt-1 text-emerald-400">
                {activeSessions.filter((s) => s.session_type === 'visitor').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">Visitor carpark sessions</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Whitelisted Residents
              </span>
              <CardTitle className="text-2xl font-mono mt-1 text-blue-400">
                {whitelist.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">Approved Clerk user accounts</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Demerits Issued
              </span>
              <CardTitle className="text-2xl font-mono mt-1 text-amber-400">
                {demerits.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">Logged community warnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'whitelist'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              Resident Whitelist & Clerk Sync
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              Live Stays ({activeSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('demerits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'demerits'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              Demerit Enforcement
            </button>
          </div>

          {activeTab === 'whitelist' && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resident & Clerk Sync</span>
            </Button>
          )}
        </div>

        {/* TAB 1: RESIDENT WHITELIST & CLERK SYNC */}
        {activeTab === 'whitelist' && (
          <Card className="border">
            <CardHeader className="py-4 px-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">Resident Whitelist Directory</CardTitle>
                  <CardDescription>
                    Approved residents authorized to sign in and book visitor spots
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, unit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Assigned Parks</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Clerk Status</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWhitelist.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-bold text-white">{user.name}</TableCell>
                      <TableCell className="font-mono text-xs">{user.email}</TableCell>
                      <TableCell className="font-bold text-slate-300">
                        {user.unit_number}
                      </TableCell>
                      <TableCell className="font-mono">{user.assigned_parks || 1} Park</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'destructive'
                              : user.role === 'management'
                              ? 'info'
                              : 'outline'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => removeWhitelistedUser(user.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: LIVE SESSIONS */}
        {activeTab === 'sessions' && (
          <Card className="border">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm">Live Parking Sessions (23 Visitor Bays)</CardTitle>
              <CardDescription>
                Real-time active cars parked across Millennium Village
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activeSessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  All 23 visitor carparks are currently free.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Spot</TableHead>
                      <TableHead>Vehicle Plate</TableHead>
                      <TableHead>Host Unit</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Session Type</TableHead>
                      <TableHead>Expected Expiry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono font-black text-white">
                          {s.spot_number}
                        </TableCell>
                        <TableCell>
                          <PlateCard plate={s.vehicle_plate} size="xs" showScrews={true} />
                        </TableCell>
                        <TableCell className="font-bold text-slate-200">{s.unit_number}</TableCell>
                        <TableCell>{s.visitor_name || 'Anonymous Visitor'}</TableCell>
                        <TableCell>
                          <Badge variant={s.session_type === 'visitor' ? 'success' : 'warning'}>
                            {s.session_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-300">
                          {s.expected_end_time
                            ? new Date(s.expected_end_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: DEMERIT ENFORCEMENT */}
        {activeTab === 'demerits' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issue Demerit Form */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm">Log Parking Infringement</CardTitle>
                <CardDescription>Issue violation warnings or overstay demerits</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDemerit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-300">
                      Unit Address *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Unit 12"
                      value={demeritUnit}
                      onChange={(e) => setDemeritUnit(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-300">
                      Vehicle Plate *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. HZZ303"
                      value={demeritPlate}
                      onChange={(e) => setDemeritPlate(e.target.value.toUpperCase())}
                      className="font-mono uppercase font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-300">
                      Carpark Spot
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. V16"
                      value={demeritSpot}
                      onChange={(e) => setDemeritSpot(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-300">
                      Violation Description
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Parked > 24 hours without authorization"
                      value={demeritReason}
                      onChange={(e) => setDemeritReason(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isIssuingDemerit}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  >
                    {isIssuingDemerit ? 'Logging Notice...' : 'Issue Demerit Warning'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Demerits Table */}
            <Card className="border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Demerits Log</CardTitle>
                <CardDescription>Recent infractions and notices</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Plate</TableHead>
                      <TableHead>Spot</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demerits.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-bold text-white">{d.unit_number}</TableCell>
                        <TableCell>
                          <PlateCard plate={d.vehicle_plate} size="micro" />
                        </TableCell>
                        <TableCell className="font-mono text-slate-300">{d.spot_number}</TableCell>
                        <TableCell className="text-xs text-slate-300">{d.description}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{d.demerit_points} pt</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Add Whitelisted Resident</h3>
                  <p className="text-xs text-slate-400">Syncs directly to Clerk backend allowlist</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResident} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="resident@example.com"
                  value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Resident Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={wlName}
                  onChange={(e) => setWlName(e.target.value)}
                />
              </div>

              {/* Preconfigured Unit Selection */}
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300 flex items-center justify-between">
                  <span>Assign to Preconfigured Unit *</span>
                  <span className="text-[10px] text-blue-400 font-normal">Multiple residents per unit allowed</span>
                </label>
                <select
                  value={wlUnit}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setWlUnit(selected);
                    const match = (units.length > 0 ? units : Array.from({ length: 27 }, (_, i) => ({ id: `unit-${i + 1}`, unit_number: `Unit ${i + 1}`, assigned_parks: i === 0 ? 2 : 1 }))).find(u => u.unit_number === selected);
                    if (match) setWlParks(match.assigned_parks || 1);
                  }}
                  className="w-full h-9 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white"
                  required
                >
                  {(units.length > 0 ? units : Array.from({ length: 27 }, (_, i) => ({ id: `unit-${i + 1}`, unit_number: `Unit ${i + 1}`, assigned_parks: i === 0 ? 2 : 1 }))).map((u) => (
                    <option key={u.id || u.unit_number} value={u.unit_number}>
                      {u.unit_number} — {u.assigned_parks || 1} {u.assigned_parks === 1 ? 'Park' : 'Parks'} quota
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1 text-slate-300">
                    Unit Park Quota (Admin Set)
                  </label>
                  <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wlParks} {wlParks === 1 ? 'Park' : 'Parks'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1 text-slate-300">
                    Access Role
                  </label>
                  <select
                    value={wlRole}
                    onChange={(e) => setWlRole(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white"
                  >
                    <option value="user">User (Resident)</option>
                    <option value="management">Management</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-300 text-[11px]">
                Upon saving, this email will be linked to {wlUnit || 'the unit'} and allowed to sign in through Clerk immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingWl}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {isSubmittingWl ? 'Syncing to Clerk...' : 'Save & Sync to Clerk'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
