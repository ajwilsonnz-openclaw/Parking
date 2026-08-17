'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Database,
  BarChart3,
  Settings,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { D1Studio } from '@/components/admin/D1Studio';
import { CloudflareUsageMeter } from '@/components/admin/CloudflareUsageMeter';
import { UnitsQuotaManager } from '@/components/admin/UnitsQuotaManager';

export default function AdminPage() {
  const { currentUser, config, updateConfig, refetch } = useApp();
  const [activeTab, setActiveTab] = useState<'units' | 'd1_studio' | 'cloudflare_meter' | 'settings'>('units');

  // Config State
  const [maxStayHours, setMaxStayHours] = useState<number>(config?.max_visitor_hours || 24);
  const [demeritThreshold, setDemeritThreshold] = useState<number>(config?.demerit_fine_threshold || 3);
  const [fineAmount, setFineAmount] = useState<number>(config?.demerit_fine_amount || 65);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSavedNotice, setConfigSavedNotice] = useState<boolean>(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      await updateConfig({
        max_visitor_hours: maxStayHours,
        demerit_fine_threshold: demeritThreshold,
        demerit_fine_amount: fineAmount,
      });
      setConfigSavedNotice(true);
      setTimeout(() => setConfigSavedNotice(false), 4000);
      refetch();
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg,#10151A)] text-slate-100 flex flex-col">
      {/* Top Desktop Admin Header */}
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
            <Sliders className="w-5 h-5 text-rose-400" />
            <h1 className="text-sm font-black text-white">
              Millennium Village Super Admin & D1 Studio
            </h1>
            <Badge variant="destructive" className="ml-2">
              Super Admin
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/management"
            className="px-3 py-1.5 rounded-xl border border-white/15 text-xs font-bold text-slate-300 hover:text-white bg-black/30 transition-colors"
          >
            Management Dashboard
          </Link>
          <div className="text-right">
            <span className="text-xs font-bold block text-white">
              {currentUser?.name || 'Super Admin'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {currentUser?.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('units')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'units'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Units & Park Quotas</span>
            </button>
            <button
              onClick={() => setActiveTab('d1_studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'd1_studio'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>D1 Database Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('cloudflare_meter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cloudflare_meter'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Cloudflare Free Tier & Cost Meter</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-black/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Complex Rules & Config</span>
            </button>
          </div>
        </div>

        {/* TAB 1: UNITS & PARK QUOTAS */}
        {activeTab === 'units' && (
          <div>
            <UnitsQuotaManager />
          </div>
        )}

        {/* TAB 2: D1 DATABASE STUDIO */}
        {activeTab === 'd1_studio' && (
          <div>
            <D1Studio />
          </div>
        )}

        {/* TAB 2: CLOUDFLARE USAGE & COST METER */}
        {activeTab === 'cloudflare_meter' && (
          <div>
            <CloudflareUsageMeter />
          </div>
        )}

        {/* TAB 3: SYSTEM CONFIG */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm">Complex Global Rules</CardTitle>
                <CardDescription>
                  Configure parking constraints and enforcement rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {configSavedNotice && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>System configuration saved successfully.</span>
                  </div>
                )}

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-slate-300">
                      Maximum Visitor Stay Duration (Hours)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={72}
                      value={maxStayHours}
                      onChange={(e) => setMaxStayHours(parseInt(e.target.value) || 24)}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Current policy: 24 hours max stay per visitor session.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-300">
                        Demerit Points for Fine Threshold
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={demeritThreshold}
                        onChange={(e) =>
                          setDemeritThreshold(parseInt(e.target.value) || 3)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-300">
                        Body Corp Fine Amount ($ NZD)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={500}
                        value={fineAmount}
                        onChange={(e) => setFineAmount(parseInt(e.target.value) || 65)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingConfig}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
