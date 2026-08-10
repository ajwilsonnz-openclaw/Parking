'use client';

import { ClerkProvider } from '@clerk/nextjs';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasKey = typeof pk === 'string' && pk.startsWith('pk_');

export function ConditionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!hasKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={pk}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#0066ff',
          fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
