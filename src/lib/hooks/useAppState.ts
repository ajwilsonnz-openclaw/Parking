'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SystemConfig } from '@/types';

const REFRESH_MS = 30_000;

export interface AppState {
  user: any | null;
  site?: any;
  sections?: any[];
  carparks: any[];
  sessions: any[];
  vehicles: any[];
  savedGuests: any[];
  demerits: any[];
  rentals: any[];
  whitelist: any[];
  units: any[];
  config: SystemConfig;
  notifications: any[];
}

/**
 * SWR-style hook: fetch /api/state, refetch on:
 *   - visibility change (when user returns to tab)
 *   - every 30s while focused
 *   - after any mutation (via invalidate())
 */
export function useAppState() {
  const [data, setData] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invalidateRef = useRef<() => void>(() => {});

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setData(json);
      setIsLoading(false);
    } catch (err) {
      console.error('useAppState fetch error:', err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') refetch();
    }, REFRESH_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
    };
  }, [refetch]);

  const invalidate = useCallback(() => { refetch(); }, [refetch]);
  invalidateRef.current = invalidate;

  return { data, isLoading, refetch: invalidateRef.current };
}

/** Helper: POST helper with error handling */
export async function apiPost<T = any>(url: string, body: any): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const adminEmail = sessionStorage.getItem('mvp_admin_email') || sessionStorage.getItem('mvp_mgmt_email');
    if (adminEmail) headers['x-user-email'] = adminEmail;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const adminEmail = sessionStorage.getItem('mvp_admin_email') || sessionStorage.getItem('mvp_mgmt_email');
    if (adminEmail) headers['x-user-email'] = adminEmail;
  }

  const res = await fetch(url, { method: 'DELETE', headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Delete failed: ${res.status}`);
  return data as T;
}
