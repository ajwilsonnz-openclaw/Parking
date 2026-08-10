import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

import { ThemeProvider, themeInitScript } from '@/lib/theme/ThemeProvider';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { ConditionalClerkProvider } from '@/components/providers/ConditionalClerkProvider';
import { AppProvider } from '@/lib/context/AppContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Millennium Village Parking',
  description: 'Smart car park booking & enforcement for Millennium Village.',
  applicationName: 'Millennium Village Parking',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Millennium Village Parking',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Millennium Village Parking',
    description: 'Visitor & resident car park booking.',
    images: [{ url: '/icons/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-bg text-ink pb-24 md:pb-8">
        <ConditionalClerkProvider>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}
