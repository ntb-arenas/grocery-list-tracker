import type { Metadata, Viewport } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';
const AnimatedLayout = dynamic(() => import('./components/AnimatedLayout'), { ssr: false });

export const metadata: Metadata = {
  title: 'Grocery List Tracker',
  description: 'Track your grocery items with ease',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Grocery List',
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
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/icon-192x192.png' />
      </head>
      <body className='antialiased h-[100lvh] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
