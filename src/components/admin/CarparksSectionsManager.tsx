'use client';

import React, { useState, useMemo } from 'react';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  X,
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
import { apiPost, apiDelete } from '@/lib/hooks/useAppState';

export function CarparksSectionsManager() {
  const { carparks, sessions, refetch } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSpot, setEditingSpot] = useState<any | null>(null);

  const [spotNumber, setSpotNumber] = useState<string>('');
  const [sectionName, setSectionName] = useState<string>('Entrance');
  const [sectionId, setSectionId] = useState<string>('sec_entrance');
  const [status, setStatus] = useState<'available' | 'maintenance' | 'occupied'>('available');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeSessionMap = useMemo(() => {
    const map = new Map<string, any>();
    sessions.forEach((s) => {
      if (s.is_active) {
        if (s.spot_number) map.set(s.spot_number, s);
        if (s.carpark_id) map.set(s.carpark_id, s);
      }
    });
    return map;
  }, [sessions]);

  // Group by sections
  const sectionsList = [
    { id: 'sec_entrance', name: 'Entrance', range: 'Spots 23–21' },
    { id: 'sec_units_8_13', name: 'Units 8–13', range: 'Spots 20–15' },
    { id: 'sec_units_1_7', name: 'Units 1–7', range: 'Spots 14–04' },
    { id: 'sec_back', name: 'Back of Complex', range: 'Spots 03–01' },
  ];

  const sortedParks = useMemo(() => {
    const list = [...carparks];
    return list.sort((a, b) => {
      const numA = parseInt(a.spot_number.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.spot_number.replace(/\D/g, '')) || 0;
      return numB - numA; // 23 down to 01
    });
  }, [carparks]);

  const handleSaveSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotNumber.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiPost('/api/admin/carparks', {
        id: editingSpot?.id,
        spot_number: spotNumber.trim().toUpperCase(),
        section: sectionName,
        section_id: sectionId,
        status,
      });

      setFeedback({
        type: 'success',
        message: `Successfully saved carpark bay ${spotNumber.trim().toUpperCase()} in ${sectionName}.`,
      });
      setShowAddModal(false);
      setEditingSpot(null);
      setSpotNumber('');
      refetch();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save carpark bay' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCanonical = async () => {
    if (!confirm('Reset all carparks and sections in D1 to the canonical 23 visitor bays layout? This clears any duplicate spots.')) {
      return;
    }

    setIsResetting(true);
    setFeedback(null);
    try {
      await apiPost('/api/admin/carparks', { action: 'reset_canonical' });
      setFeedback({
        type: 'success',
        message: 'Successfully reset and synchronized the canonical 23 visitor bays (Spots 23–01 across all 4 complex sections).',
      });
      refetch();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reset canonical carparks' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteSpot = async (id: string, spot: string) => {
    if (!confirm(`Are you sure you want to remove bay ${spot}?`)) return;
    try {
      await apiDelete(`/api/admin/carparks?id=${encodeURIComponent(id)}`);
      refetch();
    } catch (err: any) {
      alert(`Failed to delete carpark: ${err.message}`);
    }
  };

  const openEdit = (cp: any) => {
    setEditingSpot(cp);
    setSpotNumber(cp.spot_number);
    setSectionName(cp.section || 'Entrance');
    setSectionId(cp.section_id || 'sec_entrance');
    setStatus(cp.status || 'available');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-rose-400" />
            <span>Visitor Carpark Stalls & Sections Setup</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin configuration: Configure all physical visitor parking stalls and their assigned complex areas in the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetCanonical}
            disabled={isResetting}
            className="text-xs font-bold gap-1.5 border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Syncing...' : 'Reset Canonical 23 Bays'}</span>
          </Button>

          <Button
            onClick={() => {
              setEditingSpot(null);
              setSpotNumber('');
              setSectionName('Entrance');
              setSectionId('sec_entrance');
              setStatus('available');
              setShowAddModal(true);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Carpark Stall</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Sections Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sectionsList.map((sec) => {
          const count = sortedParks.filter((p) => p.section_id === sec.id || (p.section && p.section.toLowerCase().includes(sec.name.toLowerCase()))).length;
          return (
            <div key={sec.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{sec.name}</span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {count} Bays
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{sec.range}</p>
            </div>
          );
        })}
      </div>

      {/* Carpark Table */}
      <Card className="border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="w-[120px] text-xs font-bold text-slate-300">Spot Number</TableHead>
                <TableHead className="text-xs font-bold text-slate-300">Complex Section</TableHead>
                <TableHead className="w-[140px] text-xs font-bold text-slate-300">Current Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-300">Live Active Session</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedParks.map((cp) => {
                const session = activeSessionMap.get(cp.spot_number) || activeSessionMap.get(cp.id);
                return (
                  <TableRow key={cp.id || cp.spot_number} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="font-mono font-black text-xs text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-mono font-black text-xs">
                          {cp.spot_number}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cp.section || 'Entrance'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={cp.status === 'occupied' || session ? 'default' : cp.status === 'maintenance' ? 'destructive' : 'outline'}
                        className="text-[10px] font-bold"
                      >
                        {session ? 'Occupied (Live)' : cp.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-300">
                      {session ? (
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-amber-400">{session.vehicle_plate}</span>
                          <span className="text-[11px] text-slate-400 block">
                            {session.visitor_name || 'Guest'} · {session.unit_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold">Available for booking</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(cp)}
                          title="Edit Spot"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpot(cp.id, cp.spot_number)}
                          title="Delete Spot"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Carpark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingSpot ? `Edit Carpark ${editingSpot.spot_number}` : 'Add Visitor Carpark'}
                  </h3>
                  <p className="text-xs text-slate-400">Database stall and section assignment</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpot} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Spot Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. V23 or V01"
                  value={spotNumber}
                  onChange={(e) => setSpotNumber(e.target.value.toUpperCase())}
                  className="font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Assigned Complex Section *
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSectionId(id);
                    const match = sectionsList.find((s) => s.id === id);
                    if (match) setSectionName(match.name);
                  }}
                  className="w-full h-9 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white"
                  required
                >
                  {sectionsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.range})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
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
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Carpark Stall'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
