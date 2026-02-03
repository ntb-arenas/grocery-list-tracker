import { useState, useEffect } from 'react';
import { isBrowser } from '../utils/isBrowser';
import { getLocalStorageItem } from '../utils/storage';

export function useShouldShowApp() {
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkShouldShow = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = (window.navigator as any).standalone || standalone;
      const hasBypassed = getLocalStorageItem('bypass-install') === 'true';
      setShouldShowApp(isInStandaloneMode || hasBypassed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    checkShouldShow();
    if (isBrowser()) {
      window.addEventListener('bypass-install', checkShouldShow);
    }

    return () => {
      if (isBrowser()) {
        window.removeEventListener('bypass-install', checkShouldShow);
      }
    };
  }, []);

  return { shouldShowApp, isLoading };
}
