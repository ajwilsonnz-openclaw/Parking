'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
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

export function UnitsQuotaManager() {
  const { units, whitelist, refetch } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);

  const [unitNumber, setUnitNumber] = useState<string>('');
  const [assignedParks, setAssignedParks] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Group whitelisted residents by unit number
  const residentsByUnit = useMemo(() => {
    const map = new Map<string, string[]>();
    whitelist.forEach((w) => {
      const u = (w.unit_number || '').trim().toLowerCase();
      if (!map.has(u)) map.set(u, []);
      map.get(u)!.push(`${w.name || w.email} (${w.email})`);
    });
    return map;
  }, [whitelist]);

  // Combine default 1-27 with database units
  const allUnits = useMemo(() => {
    const list = units.length > 0
      ? [...units]
      : Array.from({ length: 27 }, (_, i) => ({
          id: `unit-${i + 1}`,
          unit_number: `Unit ${i + 1}`,
          assigned_parks: i === 0 ? 2 : 1,
          notes: i === 0 ? 'Body Corporate Manager Unit' : undefined,
        }));

    return list.sort((a, b) => {
      const numA = parseInt(a.unit_number.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.unit_number.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [units]);

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiPost('/api/admin/units', {
        id: editingUnit?.id,
        unit_number: unitNumber.trim(),
        assigned_parks: assignedParks,
        notes: notes.trim() || undefined,
      });

      setFeedback({
        type: 'success',
        message: `Successfully configured ${unitNumber.trim()} with ${assignedParks} ${assignedParks === 1 ? 'park' : 'parks'} quota.`,
      });
      setShowAddModal(false);
      setEditingUnit(null);
      setUnitNumber('');
      setAssignedParks(1);
      setNotes('');
      refetch();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save unit configuration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await apiDelete(`/api/admin/units?id=${encodeURIComponent(id)}`);
      refetch();
    } catch (err: any) {
      alert(`Failed to delete unit: ${err.message}`);
    }
  };

  const openEdit = (u: any) => {
    setEditingUnit(u);
    setUnitNumber(u.unit_number);
    setAssignedParks(u.assigned_parks || 1);
    setNotes(u.notes || '');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-400" />
            <span>Preconfigured Units & Assigned Carpark Quotas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin settings: Set how many allocated carparks each unit owns. When managers add residents, they select from these preconfigured units. Multiple residents can share a single unit.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingUnit(null);
            setUnitNumber('');
            setAssignedParks(1);
            setNotes('');
            setShowAddModal(true);
          }}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Unit Configuration</span>
        </Button>
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

      {/* Units Table */}
      <Card className="border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="w-[140px] text-xs font-bold text-slate-300">Unit Number</TableHead>
                <TableHead className="w-[160px] text-xs font-bold text-slate-300">Assigned Parks Quota</TableHead>
                <TableHead className="text-xs font-bold text-slate-300">Linked Whitelisted Residents</TableHead>
                <TableHead className="text-xs font-bold text-slate-300">Notes / Type</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUnits.map((u) => {
                const residents = residentsByUnit.get(u.unit_number.trim().toLowerCase()) || [];
                return (
                  <TableRow key={u.id || u.unit_number} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="font-bold text-white text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-mono text-xs">
                          {u.unit_number.replace(/\D/g, '') || '#'}
                        </div>
                        <span>{u.unit_number}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-bold text-xs bg-white/5 border-white/15 gap-1.5 py-1 px-2.5">
                        <Car className="w-3.5 h-3.5 text-blue-400" />
                        <span>{u.assigned_parks || 1} {u.assigned_parks === 1 ? 'Park' : 'Parks'}</span>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {residents.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                            <Users className="w-3.5 h-3.5" />
                            <span>{residents.length} {residents.length === 1 ? 'Resident' : 'Residents'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-md">
                            {residents.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No whitelisted residents assigned yet</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-slate-300">
                      {u.notes || <span className="text-slate-500 text-[11px]">Standard Residential</span>}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit Quota & Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(u.id, u.unit_number)}
                          title="Delete Unit"
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

      {/* Add / Edit Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingUnit ? `Edit ${editingUnit.unit_number}` : 'Configure Complex Unit'}
                  </h3>
                  <p className="text-xs text-slate-400">Admin preconfigured unit and carpark quota</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Unit Number / Address *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Unit 5 or Unit 28"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Assigned Parks Quota *
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={assignedParks}
                    onChange={(e) => setAssignedParks(parseInt(e.target.value) || 1)}
                    className="w-28"
                    required
                  />
                  <span className="text-xs text-slate-400">
                    Allocated private bays for this unit address
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Notes / Unit Description (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Corner 3-Bedroom Townhouse"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 text-[11px]">
                💡 Multiple residents, tenants, or family members can be whitelisted under this preconfigured unit in the Management dashboard.
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
                  {isSubmitting ? 'Saving...' : 'Save Unit Quota'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
