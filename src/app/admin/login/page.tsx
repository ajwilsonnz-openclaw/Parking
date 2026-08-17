'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  Database,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('ajwilsonnz@gmail.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mvp_admin_authed', 'true');
        sessionStorage.setItem('mvp_admin_email', email);
      }
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail('ajwilsonnz@gmail.com');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mvp_admin_authed', 'true');
      sessionStorage.setItem('mvp_admin_email', 'ajwilsonnz@gmail.com');
    }
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#10151A] text-slate-100 flex flex-col items-center justify-center p-4 relative select-none">
      {/* Dynamic Red/Amber Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(225,29,72,0.16),transparent_70%)]" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25 border border-rose-400/30">
            <Sliders className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Super Admin & D1 Studio
          </h1>
          <p className="text-xs text-slate-400">
            Millennium Village Core Infrastructure & D1 Database Console
          </p>
          <div className="pt-1">
            <Badge variant="destructive">Subdomain Ready: admin.millenniumvillage.co.nz</Badge>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Sign In to Super Admin</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Master administrator access with D1 database CRUD privileges
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
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ajwilsonnz@gmail.com"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">
                  Master Key / Password
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
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-10 text-xs shadow-lg shadow-rose-600/20"
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Super Admin'}
              </Button>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/30 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Super Admin Access (Adam Wilson • Unit 5)</span>
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
