import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Millennium Village Parking',
  description: 'Smart car park booking & enforcement for Millennium Village residents and visitors.',
  applicationName: 'MV Parking',
  manifest: '/manifest.webmanifest',
  metadataBase: new URL('https://parking-pwa.pages.dev'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MV Parking',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/icons/icon-192.png' }],
  },
  openGraph: {
    title: 'Millennium Village Parking',
    description: 'Visitor & resident car park booking.',
    images: [{ url: '/icons/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100 pb-20 md:pb-6">
        <ServiceWorkerRegister />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
