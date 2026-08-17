'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Demo mode bypasses login and lets you freely switch roles.
 * Activate via ?demo=1 in the URL. Persisted in sessionStorage.
 * Used for development/testing without needing email delivery.
 */
export function useDemoMode(): boolean {
  const searchParams = useSearchParams();
  const [demo, setDemo] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('demo=1') ||
      sessionStorage.getItem('mvp-demo') === '1'
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromUrl = searchParams?.get('demo') === '1' || window.location.search.includes('demo=1');
    if (fromUrl) {
      sessionStorage.setItem('mvp-demo', '1');
      setDemo(true);
      return;
    }
    setDemo(sessionStorage.getItem('mvp-demo') === '1');
  }, [searchParams]);

  return demo;
}
