'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sliders,
  Database,
  BarChart3,
  Settings,
  Building2,
  CheckCircle2,
  LogOut,
  ParkingSquare,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { D1Studio } from '@/components/admin/D1Studio';
import { CloudflareUsageMeter } from '@/components/admin/CloudflareUsageMeter';
import { UnitsQuotaManager } from '@/components/admin/UnitsQuotaManager';
import { CarparksSectionsManager } from '@/components/admin/CarparksSectionsManager';
import { PortalSidebar } from '@/components/admin/PortalSidebar';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { currentUser, config, updateConfig, logout, refetch } = useApp();
  const [activeTab, setActiveTab] = useState<'carparks' | 'units' | 'd1_studio' | 'cloudflare_meter' | 'settings'>('carparks');

  useEffect(() => {
    if (tabParam === 'carparks' || tabParam === 'units' || tabParam === 'd1_studio' || tabParam === 'cloudflare_meter' || tabParam === 'settings') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await logout();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg,#10151A)] text-slate-100 flex">
      {/* Universal Desktop Portal Sidebar */}
      <PortalSidebar currentTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Admin Header */}
        <header className="h-16 border-b border-white/10 bg-black/40 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h1 className="text-sm font-black text-white">
              Admin & Database Studio
            </h1>
            <Badge variant="destructive" className="text-xs">
              Admin
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
              onClick={handleLogout}
              className="text-xs font-bold gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
          {/* TAB 0: CARPARKS & SECTIONS */}
          {activeTab === 'carparks' && (
            <div>
              <CarparksSectionsManager />
            </div>
          )}

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

          {/* TAB 3: CLOUDFLARE USAGE & COST METER */}
          {activeTab === 'cloudflare_meter' && (
            <div>
              <CloudflareUsageMeter />
            </div>
          )}

          {/* TAB 4: SYSTEM CONFIG */}
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
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#10151A] text-white p-8">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}
