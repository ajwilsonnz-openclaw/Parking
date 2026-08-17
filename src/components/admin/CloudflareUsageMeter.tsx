'use client';

import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  Cpu,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MetricItem {
  name: string;
  category: string;
  icon: React.ElementType;
  currentValue: number;
  currentFormatted: string;
  freeLimit: number;
  freeLimitFormatted: string;
  unit: string;
  paidAllowanceFormatted: string;
}

export const CloudflareUsageMeter: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly'>('daily');

  const metrics: MetricItem[] = [
    {
      name: 'D1 Database Row Reads',
      category: 'Cloudflare D1',
      icon: Database,
      currentValue: 1420,
      currentFormatted: '1,420 rows',
      freeLimit: 5000000,
      freeLimitFormatted: '5,000,000 / day',
      unit: 'reads',
      paidAllowanceFormatted: '25 Billion / month',
    },
    {
      name: 'D1 Database Row Writes',
      category: 'Cloudflare D1',
      icon: Database,
      currentValue: 310,
      currentFormatted: '310 rows',
      freeLimit: 100000,
      freeLimitFormatted: '100,000 / day',
      unit: 'writes',
      paidAllowanceFormatted: '50 Million / month',
    },
    {
      name: 'D1 Total Storage',
      category: 'Cloudflare D1',
      icon: HardDrive,
      currentValue: 1.4,
      currentFormatted: '1.4 MB',
      freeLimit: 5000,
      freeLimitFormatted: '5.0 GB (5,000 MB)',
      unit: 'storage',
      paidAllowanceFormatted: '10 GB included + $0.75/GB',
    },
    {
      name: 'Worker & Edge Requests',
      category: 'Cloudflare Workers',
      icon: Cpu,
      currentValue: 2840,
      currentFormatted: '2,840 reqs',
      freeLimit: 100000,
      freeLimitFormatted: '100,000 / day',
      unit: 'requests',
      paidAllowanceFormatted: '10 Million / month included',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Free Tier Status Summary */}
      <div
        className="rounded-2xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.28)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Cloudflare Free Tier Active</h3>
              <Badge variant="success">100% Free</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Millennium Village is using <strong>&lt; 0.5%</strong> of Cloudflare free limits. Monthly projected cost: <strong>$0.00 NZD</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Next reset: Midnight UTC</span>
        </div>
      </div>

      {/* Grid of Usage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const usagePercent = Math.min(100, (metric.currentValue / metric.freeLimit) * 100);
          const formattedPercent = usagePercent < 0.01 ? '<0.01%' : `${usagePercent.toFixed(2)}%`;

          return (
            <Card key={metric.name} className="relative overflow-hidden border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {metric.category}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <CardTitle className="text-xs mt-1 text-slate-100">{metric.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-white font-mono">
                    {metric.currentFormatted}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {formattedPercent}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(2, usagePercent)}%`,
                      backgroundColor: usagePercent > 80 ? '#f43f5e' : usagePercent > 50 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Limit:</span>
                  <span className="font-mono font-bold text-slate-300">{metric.freeLimitFormatted}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Cost Comparison Table & Calculator */}
      <Card className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Cloudflare Plan & Cost Comparison</CardTitle>
              <CardDescription>
                Compare the current Free Tier vs. Cloudflare Workers Paid Plan ($5/mo)
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              Cheapest Plan: $5 USD / mo
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Plan Box */}
            <div
              className="rounded-2xl p-5 border space-y-4 relative"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Cloudflare Free Tier</h4>
                  <p className="text-xs text-slate-400">Current Plan (Active)</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 font-mono">$0</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
              </div>

              <ul className="text-xs space-y-2 text-slate-300 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>5,000,000</strong> D1 Reads / day (Free)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>100,000</strong> D1 Writes / day (Free)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>5.0 GB</strong> D1 Storage (Free)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>100,000</strong> Worker Requests / day (Free)</span>
                </li>
              </ul>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Recommended: Millennium Village (23 parks) will comfortably run forever on this plan at zero cost.
              </div>
            </div>

            {/* Paid Plan Box */}
            <div
              className="rounded-2xl p-5 border space-y-4 relative"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Workers Paid Plan</h4>
                  <p className="text-xs text-slate-400">Cheapest Paid Upgrade</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono">$5</span>
                  <span className="text-xs text-slate-400"> USD / mo (~$8.50 NZD)</span>
                </div>
              </div>

              <ul className="text-xs space-y-2 text-slate-300 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>25 Billion</strong> D1 Reads / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>50 Million</strong> D1 Writes / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>10 GB</strong> D1 Storage included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>10 Million</strong> Worker Requests / month</span>
                </li>
              </ul>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-slate-400 text-[11px]">
                Upgrade trigger: Only required if operating across multiple apartment complexes or exceeding 100k requests/day.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
