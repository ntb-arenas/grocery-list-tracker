import { useState, useEffect } from 'react';

export function useShouldShowApp() {
  const [shouldShowApp, setShouldShowApp] = useState(false);

  useEffect(() => {
    const checkShouldShow = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = (window.navigator as any).standalone || standalone;
      const hasBypassed = localStorage.getItem('bypass-install') === 'true';
      setShouldShowApp(isInStandaloneMode || hasBypassed);
    };

    checkShouldShow();
    window.addEventListener('bypass-install', checkShouldShow);

    return () => {
      window.removeEventListener('bypass-install', checkShouldShow);
    };
  }, []);

  return shouldShowApp;
}
