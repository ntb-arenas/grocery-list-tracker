import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from './providers/AppProviders';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import OfflineIndicator from './components/OfflineIndicator';

export const metadata: Metadata = {
  title: {
    default: 'Grocery List Tracker',
    template: '%s | Grocery List Tracker',
  },
  description: 'Track your grocery items with ease - Cloud synced, real-time updates',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Grocery List',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  keywords: ['grocery', 'shopping', 'list', 'tracker', 'pwa'],
  authors: [{ name: 'Grocery List Tracker Team' }],
  creator: 'Grocery List Tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Grocery List Tracker',
    description: 'Track your grocery items with ease',
    siteName: 'Grocery List Tracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/icon-192x192.png' />
      </head>
      <body className='antialiased min-h-[100svh] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        <OfflineIndicator />
        <ServiceWorkerRegistration />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
