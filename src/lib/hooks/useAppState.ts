'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SystemConfig } from '@/types';

const REFRESH_MS = 30_000;

export interface AppState {
  user: any | null;
  carparks: any[];
  sessions: any[];
  vehicles: any[];
  savedGuests: any[];
  demerits: any[];
  rentals: any[];
  whitelist: any[];
  config: SystemConfig;
  notifications: any[];
}

/**
 * SWR-style hook: fetch /api/state, refetch on:
 *   - visibility change (when user returns to tab)
 *   - every 30s while focused
 *   - after any mutation that we know changed state
 * Exposes { data, refetch, isLoading }.
 */
export function useAppState() {
  const [data, setData] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invalidateRef = useRef<() => void>(() => {});

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.status === 401) {
        setData(null);
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setData(json);
      setIsLoading(false);
    } catch (err) {
      console.error('useAppState fetch error:', err);
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Poll every 30s while visible
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

  // Provide an imperative invalidate method for use in mutations
  const invalidate = useCallback(async () => { await refetch(); }, [refetch]);
  invalidateRef.current = invalidate;

  return { data, isLoading, refetch: invalidateRef.current, invalidate };
}

/** Helper: POST helper with error handling */
export async function apiPost<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Delete failed: ${res.status}`);
  return data as T;
}
