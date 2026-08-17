'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context/AppContext';

export default function ManagementLoginPage() {
  const router = useRouter();
  const { refetch } = useApp();

  const [email, setEmail] = useState<string>('manager@millennium.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Set management session cookie/storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mvp_mgmt_authed', 'true');
        sessionStorage.setItem('mvp_mgmt_email', email);
      }
      setTimeout(() => {
        router.push('/management');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleQuickDemoManager = () => {
    setEmail('manager@millennium.com');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mvp_mgmt_authed', 'true');
      sessionStorage.setItem('mvp_mgmt_email', 'manager@millennium.com');
    }
    router.push('/management');
  };

  return (
    <div className="min-h-screen bg-[#10151A] text-slate-100 flex flex-col items-center justify-center p-4 relative select-none">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(59,130,246,0.18),transparent_70%)]" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Shield className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Management Portal
          </h1>
          <p className="text-xs text-slate-400">
            Millennium Village Body Corporate & Parking Operations
          </p>
          <div className="pt-1">
            <Badge variant="info">Subdomain Ready: mgmt.millenniumvillage.co.nz</Badge>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Sign In to Management</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your authorized Body Corp credentials
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Manager Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@millennium.com"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Password / Passkey
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 text-xs shadow-lg shadow-blue-600/20"
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Manager'}
              </Button>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleQuickDemoManager}
                  className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/30 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo Sign In (Sarah Jenkins • Manager)</span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Return to Resident App
          </Link>
        </div>
      </div>
    </div>
  );
}
