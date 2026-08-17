'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Play,
  Download,
  RefreshCw,
  Clock,
  Terminal,
  Layers,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
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

const TABLES = [
  { id: 'carparks', label: 'Carparks (23 bays)' },
  { id: 'parking_sessions', label: 'Parking Sessions' },
  { id: 'whitelist', label: 'Resident Whitelist' },
  { id: 'users', label: 'Users' },
  { id: 'unit_vehicles', label: 'Unit Vehicles' },
  { id: 'demerits', label: 'Demerit Records' },
  { id: 'spot_rentals', label: 'Spot Rentals' },
  { id: 'push_subscriptions', label: 'Push Subscriptions' },
  { id: 'system_config', label: 'System Config' },
];

export const D1Studio: React.FC = () => {
  const [activeTable, setActiveTable] = useState<string>('carparks');
  const [activeView, setActiveView] = useState<'tables' | 'sql'>('tables');

  // Table data state
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Inline edit state
  const [editingCell, setEditingCell] = useState<{ id: string; col: string; val: string } | null>(null);

  // Insert modal state
  const [showAddRowModal, setShowAddRowModal] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM carparks ORDER BY spot_number ASC');
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlDuration, setSqlDuration] = useState<number | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);

  const fetchTableData = useCallback(async (tableName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/d1?table=${tableName}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to load table');
      }
      setRows(data.rows || []);
      setQueryTime(data.durationMs || 0);
    } catch (err: any) {
      setErrorMsg(err.message);
      // Fallback mock rows if offline
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'tables') {
      fetchTableData(activeTable);
    }
  }, [activeTable, activeView, fetchTableData]);

  // Handle cell update
  const handleSaveCell = async (id: string, col: string, newVal: string) => {
    try {
      const res = await fetch('/api/admin/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cell',
          table: activeTable,
          id,
          column: col,
          value: newVal,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Update failed');

      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [col]: newVal } : r))
      );
      setEditingCell(null);
      setSuccessMsg(`Updated ${col} successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Handle row delete
  const handleDeleteRow = async (id: string) => {
    if (!confirm(`Are you sure you want to delete row "${id}" from ${activeTable}?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_row', table: activeTable, id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Delete failed');

      setRows((prev) => prev.filter((r) => r.id !== id));
      setSuccessMsg(`Deleted row ${id}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Handle execute SQL
  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecutingSql(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'query', sqlQuery }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Query failed');

      setSqlResults(data.rows || []);
      setSqlDuration(data.durationMs || 0);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Export table rows to CSV
  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csvLines = [
      keys.join(','),
      ...rows.map((row) =>
        keys.map((k) => JSON.stringify(row[k] ?? '')).join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTable}_export.csv`;
    a.click();
  };

  // Filter rows
  const filteredRows = rows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r).some((v) =>
      String(v).toLowerCase().includes(q)
    );
  });

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-5">
      {/* Top View Toggle: Tables Explorer vs SQL Query Console */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveView('tables')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'tables'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Table Browser</span>
          </button>
          <button
            onClick={() => setActiveView('sql')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'sql'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Console</span>
          </button>
        </div>

        {activeView === 'tables' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTableData(activeTable)}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        )}
      </div>

      {/* Notifications / Feedback */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TABLE BROWSER VIEW */}
      {activeView === 'tables' && (
        <div className="space-y-4">
          {/* Table Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {TABLES.map((tbl) => (
              <button
                key={tbl.id}
                onClick={() => setActiveTable(tbl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                  activeTable === tbl.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tbl.label}
              </button>
            ))}
          </div>

          {/* Table Header Bar */}
          <Card className="border">
            <CardHeader className="py-3 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-mono font-bold">{activeTable}</CardTitle>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{filteredRows.length} rows</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {queryTime}ms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Filter records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-500" />
                  Loading D1 records...
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No records found in table `{activeTable}`.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col} className="font-mono text-[10px]">
                            {col}
                          </TableHead>
                        ))}
                        <TableHead className="w-16 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((row, idx) => (
                        <TableRow key={row.id || idx}>
                          {columns.map((col) => {
                            const isEditing =
                              editingCell?.id === row.id && editingCell?.col === col;
                            const cellValue = row[col];

                            return (
                              <TableCell
                                key={col}
                                className="font-mono text-xs max-w-[200px] truncate"
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCell.val}
                                      onChange={(e) =>
                                        setEditingCell({
                                          ...editingCell,
                                          val: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveCell(row.id, col, editingCell.val);
                                        } else if (e.key === 'Escape') {
                                          setEditingCell(null);
                                        }
                                      }}
                                      className="py-0.5 px-1.5 bg-slate-800 border border-blue-400 rounded text-white text-xs w-full"
                                    />
                                    <button
                                      onClick={() =>
                                        handleSaveCell(row.id, col, editingCell.val)
                                      }
                                      className="p-1 hover:text-emerald-400"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingCell(null)}
                                      className="p-1 hover:text-rose-400"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    className="group flex items-center justify-between gap-1 cursor-pointer hover:text-blue-300"
                                    onClick={() => {
                                      if (row.id) {
                                        setEditingCell({
                                          id: row.id,
                                          col,
                                          val: String(cellValue ?? ''),
                                        });
                                      }
                                    }}
                                  >
                                    <span className="truncate">
                                      {cellValue === null
                                        ? '<null>'
                                        : typeof cellValue === 'boolean'
                                        ? cellValue ? 'true' : 'false'
                                        : String(cellValue)}
                                    </span>
                                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0" />
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right">
                            {row.id && (
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SQL CONSOLE VIEW */}
      {activeView === 'sql' && (
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-mono">D1 SQL Console</CardTitle>
                <CardDescription>
                  Execute raw SQL statements directly on Cloudflare D1
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleRunSql}
                disabled={isExecutingSql}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecutingSql ? 'Running...' : 'Run Query'}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                placeholder="SELECT * FROM carparks WHERE status = 'available';"
                className="w-full p-3 font-mono text-xs bg-black/60 border border-white/15 rounded-xl text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-y"
              />
            </div>

            {/* SQL Results */}
            {sqlResults !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Results ({sqlResults.length} rows)</span>
                  {sqlDuration !== null && <span>Execution Time: {sqlDuration}ms</span>}
                </div>

                {sqlResults.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-center text-xs text-slate-400">
                    Query returned 0 rows.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto rounded-xl border border-white/10">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(sqlResults[0]).map((k) => (
                            <TableHead key={k} className="font-mono text-[10px]">
                              {k}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sqlResults.map((r, i) => (
                          <TableRow key={i}>
                            {Object.keys(r).map((k) => (
                              <TableCell key={k} className="font-mono text-xs">
                                {r[k] === null ? '<null>' : String(r[k])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
