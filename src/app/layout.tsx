import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';

export const metadata: Metadata = {
  title: 'Millennium Village Parking PWA',
  description: 'Smart Car Park Booking & Priority Enforcement System for Millennium Village',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MV Parking',
  },
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100 pb-20 md:pb-6">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
