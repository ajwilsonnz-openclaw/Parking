'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
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
  Lock,
  Phone,
  ShieldCheck,
  Clock,
  LogOut,
  X,
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
import { PortalSidebar } from '@/components/admin/PortalSidebar';

function ManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const {
    currentUser,
    whitelist,
    sessions,
    carparks,
    demerits,
    units,
    logout,
    refetch,
    addWhitelistedUser,
    updateWhitelistedUser,
    removeWhitelistedUser,
    issueDemerit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'whitelist' | 'sessions' | 'demerits'>('whitelist');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (tabParam === 'sessions' || tabParam === 'demerits' || tabParam === 'whitelist') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Add Resident Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [wlEmail, setWlEmail] = useState<string>('');
  const [wlName, setWlName] = useState<string>('');
  const [wlUnit, setWlUnit] = useState<string>(units[0]?.unit_number || 'Unit 1');
  const [wlPhone, setWlPhone] = useState<string>('');
  const [wlRole, setWlRole] = useState<'user' | 'management' | 'admin'>('user');
  const [wlParks, setWlParks] = useState<number>(units[0]?.assigned_parks || 1);
  const [isSubmittingWl, setIsSubmittingWl] = useState<boolean>(false);

  // Edit Resident Form State
  const [editingResident, setEditingResident] = useState<any | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRole, setEditRole] = useState<'user' | 'management' | 'admin'>('user');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
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

      setSyncNotice(`Added ${wlEmail} to Resident Directory and synced with Clerk backend.`);
      setShowAddModal(false);
      setWlEmail('');
      setWlName('');
      setWlUnit(units[0]?.unit_number || 'Unit 1');
      setWlPhone('');
      setWlParks(units[0]?.assigned_parks || 1);
      setTimeout(() => setSyncNotice(null), 5000);
      refetch();
    } catch (err: any) {
      alert(`Failed to add resident: ${err.message}`);
    } finally {
      setIsSubmittingWl(false);
    }
  };

  const openEditModal = (resident: any) => {
    setEditingResident(resident);
    setEditName(resident.name || '');
    setEditEmail(resident.email || '');
    setEditPhone(resident.phone || '');
    setEditRole(resident.role || 'user');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident || !editEmail.trim()) return;

    setIsSubmittingEdit(true);
    try {
      await updateWhitelistedUser(
        editingResident.id,
        editEmail.trim().toLowerCase(),
        editName.trim(),
        editPhone.trim(),
        editRole
      );

      setSyncNotice(`Updated resident details for ${editEmail.trim()}. Unit and park quota preserved.`);
      setEditingResident(null);
      setTimeout(() => setSyncNotice(null), 5000);
      refetch();
    } catch (err: any) {
      alert(`Failed to update resident: ${err.message}`);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCreateDemerit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demeritUnit.trim() || !demeritPlate.trim()) return;

    setIsIssuingDemerit(true);
    try {
      const res = await issueDemerit(
        demeritUnit.trim(),
        demeritPlate.trim().toUpperCase(),
        demeritSpot.trim() || 'V--',
        'overtime',
        demeritReason.trim() || 'Exceeded authorized visitor parking window',
        1
      );

      setDemeritUnit('');
      setDemeritPlate('');
      setDemeritSpot('');
      setDemeritReason('');

      if (res?.triggered_fine) {
        alert(`🚨 DEMERIT ISSUED: Unit has reached fine threshold! Body Corp fine of $${res.fine_amount || 65} generated.`);
      } else {
        alert('Demerit warning logged successfully.');
      }
      refetch();
    } catch (err: any) {
      alert(`Failed to issue demerit: ${err.message}`);
    } finally {
      setIsIssuingDemerit(false);
    }
  };

  const filteredResidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return whitelist;
    return whitelist.filter(
      (w) =>
        (w.name || '').toLowerCase().includes(q) ||
        w.email.toLowerCase().includes(q) ||
        (w.unit_number || '').toLowerCase().includes(q) ||
        (w.role || '').toLowerCase().includes(q)
    );
  }, [whitelist, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--app-bg,#10151A)] text-slate-100 flex">
      {/* Universal Desktop Portal Sidebar */}
      <PortalSidebar currentTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-black/40 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-sm font-black text-white">
              Property Management Dashboard
            </h1>
            <Badge variant="secondary" className="text-xs">
              Manager View
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold block text-white">
                {currentUser?.name || 'Adam Wilson'}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {currentUser?.email} • {currentUser?.unit_number}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (confirm('Are you sure you want to sign out?')) {
                  await logout();
                  router.push('/');
                }
              }}
              className="text-xs font-bold gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Complex Occupancy
                </CardDescription>
                <CardTitle className="text-2xl font-black text-white">
                  {occupancyPercent}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-400">
                {occupiedSpotsCount} of {totalSpots} bays occupied
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Guests & Visitors
                </CardDescription>
                <CardTitle className="text-2xl font-black text-emerald-400">
                  {activeSessions.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-400">
                Visitor carpark sessions
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Approved Residents
                </CardDescription>
                <CardTitle className="text-2xl font-black text-blue-400">
                  {whitelist.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-400">
                Active resident directory accounts
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Demerits Issued
                </CardDescription>
                <CardTitle className="text-2xl font-black text-amber-400">
                  {demerits.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-400">
                Logged community warnings
              </CardContent>
            </Card>
          </div>

          {syncNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncNotice}</span>
            </div>
          )}

          {/* TAB 1: RESIDENT DIRECTORY */}
          {activeTab === 'whitelist' && (
            <Card className="border">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-black text-white">Resident Directory</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Approved residents authorized to sign in and book visitor spots. Preconfigured units manage allocated private bays.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search name, email, unit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs w-64"
                    />
                  </div>

                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 h-9"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Resident</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-slate-300">Resident Name</TableHead>
                      <TableHead className="text-xs font-bold text-slate-300">Email Address</TableHead>
                      <TableHead className="text-xs font-bold text-slate-300">Unit Number</TableHead>
                      <TableHead className="text-xs font-bold text-slate-300">Assigned Parks</TableHead>
                      <TableHead className="text-xs font-bold text-slate-300">Role</TableHead>
                      <TableHead className="text-xs font-bold text-slate-300">Auth Status</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResidents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                          No residents found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResidents.map((item) => (
                        <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="font-bold text-white text-xs">
                            {item.name || item.email.split('@')[0]}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-300">
                            {item.email}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-white">
                            {item.unit_number}
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {item.assigned_parks || 1} Park
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.role === 'admin'
                                  ? 'destructive'
                                  : item.role === 'management'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-[10px] font-bold"
                            >
                              {item.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit Resident Details"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeWhitelistedUser(item.id)}
                                title="Remove Resident"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: LIVE STAYS */}
          {activeTab === 'sessions' && (
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white">Live Visitor Parking Sessions</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Real-time active stays across all 23 visitor parking stalls
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-slate-400">
                    <Car className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs">No active visitor sessions currently in progress.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-transparent">
                        <TableHead className="text-xs font-bold text-slate-300">Spot</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Vehicle Plate</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Host Unit</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Visitor Info</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Started</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Expires</TableHead>
                        <TableHead className="text-right text-xs font-bold text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSessions.map((s) => (
                        <TableRow key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="font-mono font-black text-xs text-white">
                            {s.spot_number}
                          </TableCell>
                          <TableCell>
                            <PlateCard plate={s.vehicle_plate} size="xs" showScrews={true} />
                          </TableCell>
                          <TableCell className="text-xs font-bold text-white">
                            {s.unit_number}
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {s.visitor_name || <span className="text-slate-500 italic">Guest</span>}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 font-mono">
                            {new Date(s.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDemeritUnit(s.unit_number);
                                setDemeritPlate(s.vehicle_plate);
                                setDemeritSpot(s.spot_number);
                                setActiveTab('demerits');
                              }}
                              className="text-xs h-8"
                            >
                              Log Demerit
                            </Button>
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
                        placeholder="e.g. Overstayed authorized 24h window"
                        value={demeritReason}
                        onChange={(e) => setDemeritReason(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isIssuingDemerit}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs mt-2"
                    >
                      {isIssuingDemerit ? 'Logging Demerit...' : 'Issue Warning & Demerit'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Demerits List */}
              <Card className="border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">Infringement & Demerit History</CardTitle>
                  <CardDescription>All recorded parking penalties across the complex</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-transparent">
                        <TableHead className="text-xs font-bold text-slate-300">Unit</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Plate</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Spot</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Violation Reason</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Points</TableHead>
                        <TableHead className="text-xs font-bold text-slate-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demerits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                            No community infringements logged.
                          </TableCell>
                        </TableRow>
                      ) : (
                        demerits.map((d) => (
                          <TableRow key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <TableCell className="font-bold text-xs text-white">{d.unit_number}</TableCell>
                            <TableCell className="font-mono text-xs text-amber-400 font-bold">{d.vehicle_plate}</TableCell>
                            <TableCell className="text-xs text-slate-300">{d.spot_number || '--'}</TableCell>
                            <TableCell className="text-xs text-slate-300">{d.description || d.violation_type}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-rose-400">+{d.demerit_points}</TableCell>
                            <TableCell className="text-[11px] text-slate-400 font-mono">
                              {new Date(d.created_at || Date.now()).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

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
                  <h3 className="text-sm font-black text-white">Add Resident to Directory</h3>
                  <p className="text-xs text-slate-400">Links user to preconfigured unit & Clerk allowlist</p>
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

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. +64 21 555 0192"
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
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
                Upon saving, this email will be linked to {wlUnit || 'the unit'} and allowed to sign in immediately.
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
                  {isSubmittingWl ? 'Saving...' : 'Save & Sync Resident'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Details Modal (Unit and Parks are Locked) */}
      {editingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Edit Resident Details</h3>
                  <p className="text-xs text-slate-400">Update personal information and permissions</p>
                </div>
              </div>
              <button
                onClick={() => setEditingResident(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Resident Full Name
                </label>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +64 21 000 0000"
                />
              </div>

              {/* Locked Unit & Assigned Parks Info */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned Unit</span>
                  </span>
                  <span className="font-bold text-white">{editingResident.unit_number}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Allocated Carpark Quota</span>
                  </span>
                  <span className="font-bold text-white">{editingResident.assigned_parks || 1} Park</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Unit addresses and carpark quotas are managed exclusively in the Super Admin Units settings.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white"
                >
                  <option value="user">User (Resident)</option>
                  <option value="management">Management</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingResident(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#10151A] text-white p-8">Loading Management Portal...</div>}>
      <ManagementContent />
    </Suspense>
  );
}
