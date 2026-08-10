'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';

/**
 * Listens for a fresh Clerk sign-in, creates our D1 session cookie,
 * then immediately signs out of Clerk.
 */
export function ClerkSyncHandler() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [handling, setHandling] = useState(false);

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
        if (res.ok) {
          await signOut();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setHandling(false);
      }
    })();
  }, [isLoaded, isSignedIn, getToken, signOut, handling]);

  return null;
}
