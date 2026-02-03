'use client';

import { ReactNode, useEffect, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { fadeIn, pageTransition, scaleIn } from '@/lib/transitions';
import InstallPrompt from '@/app/components/InstallPrompt';

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Use layout effect to lock scroll before paint
  useLayoutEffect(() => {
    setIsNavigating(true);
    
    // Scroll to top immediately
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
    }
    
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
      setIsNavigating(false);
    }, 200); // Match transition duration

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    };
  }, [pathname]);

  return (
    <>
      <InstallPrompt />
      <AnimatePresence mode='wait'>
        <motion.div
          key={pathname}
          initial={scaleIn.initial}
          animate={scaleIn.animate}
          exit={scaleIn.exit}
          transition={scaleIn.transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
