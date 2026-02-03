'use client';

import { ReactNode, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import InstallPrompt from '@/app/components/InstallPrompt';

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return (
    <>
      <InstallPrompt />
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </>
  );
}
