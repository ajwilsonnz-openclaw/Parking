import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import { ThemeProvider, themeInitScript } from '@/lib/theme/ThemeProvider';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { ConditionalClerkProvider } from '@/components/providers/ConditionalClerkProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Millennium Village Parking',
  description: 'Smart car park booking & enforcement for Millennium Village residents and visitors.',
  applicationName: 'Millennium Village Parking',
  manifest: '/manifest.webmanifest',
  metadataBase: new URL('https://parking-pwa.pages.dev'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Millennium Village Parking',
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
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#070b12' },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-bg text-ink pb-24 md:pb-8">
        <ConditionalClerkProvider>
          <ThemeProvider>
            <ServiceWorkerRegister />
            <AppProvider>{children}</AppProvider>
          </ThemeProvider>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}
