'use client';

import React, { useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';

/**
 * Listens for a fresh Clerk sign-in, hands the verified identity off to our D1,
 * gets back our long-lived session cookie, then immediately signs out of Clerk.
 * Renders nothing — zero UI.
 */
export function ClerkSyncHandler() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [handling, setHandling] = React.useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || handling) return;

    setHandling(true);

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('/api/auth/clerk-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Sign-in failed');
          return;
        }

        // Immediately kill the Clerk session — we now authenticate via our own cookie
        await signOut();
        // Refetch app state (there's a new user / session)
        window.location.reload(); // safe — a real session handoff is rare; get a clean state
      } catch (err) {
        console.error('clerk-sync failed:', err);
      }
    })();
  }, [isLoaded, isSignedIn, getToken, signOut, handling]);

  return null;
}
