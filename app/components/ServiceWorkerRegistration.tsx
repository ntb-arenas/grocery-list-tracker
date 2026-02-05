'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          console.log('🔄 Service Worker update found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New version available');
              setUpdateAvailable(true);
            }
          });
        });

        // Check for updates every hour
        setInterval(
          () => {
            registration?.update();
          },
          60 * 60 * 1000,
        );
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    // Handle controller change
    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      console.log('🔄 Reloading for new Service Worker');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      window.removeEventListener('load', registerSW);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Show update notification
  if (updateAvailable) {
    return (
      <div className='fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50'>
        <p className='text-sm font-medium'>Update available!</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-2 text-xs bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 transition'
        >
          Refresh Now
        </button>
      </div>
    );
  }

  return null;
}
