'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerTest() {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [isOnline, setIsOnline] = useState(true);
  const [caches, setCaches] = useState<string[]>([]);
  const [swDetails, setSwDetails] = useState<string>('');

  useEffect(() => {
    // Check if online
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Service Worker status with retry logic
    const checkServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            let details = '';
            if (registration.active) {
              setSwStatus(`✅ Active (scope: ${registration.scope})`);
              details = `Active worker script: ${registration.active.scriptURL}`;
            } else if (registration.installing) {
              setSwStatus('⏳ Installing...');
              details = 'Service Worker is currently installing...';
              // Check again after a delay
              setTimeout(checkServiceWorker, 500);
            } else if (registration.waiting) {
              setSwStatus('⏸️ Waiting to activate');
              details = 'Service Worker installed but waiting to activate';
            }
            setSwDetails(details);
          } else {
            setSwStatus('⏳ Waiting for registration...');
            setSwDetails('No registration found yet, retrying...');
            // Retry after a short delay
            setTimeout(checkServiceWorker, 500);
          }
        });
      } else {
        setSwStatus('❌ Not supported');
        setSwDetails('Service Workers are not supported in this browser');
      }
    };

    // Initial check and retry after a delay to catch late registration
    checkServiceWorker();
    const retryTimeout = setTimeout(checkServiceWorker, 1000);

    // List caches and refresh periodically
    const updateCaches = () => {
      if ('caches' in window) {
        window.caches.keys().then((keys) => {
          setCaches(keys);
        });
      }
    };

    updateCaches();
    const cacheInterval = setInterval(updateCaches, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(retryTimeout);
      clearInterval(cacheInterval);
    };
  }, []);

  const clearCaches = async () => {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
      setCaches([]);
      alert('All caches cleared! Refresh the page.');
    }
  };

  return (
    <div className='min-h-screen p-8 bg-gradient-to-b from-slate-50 to-slate-100'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <h1 className='text-3xl font-bold text-slate-800'>Service Worker Test</h1>

        <div className='bg-white rounded-lg shadow-md p-6 space-y-4'>
          <div>
            <h2 className='font-semibold text-lg text-slate-700'>Network Status</h2>
            <p className='text-2xl'>{isOnline ? '🟢 Online' : '🔴 Offline'}</p>
          </div>

          <div>
            <h2 className='font-semibold text-lg text-slate-700'>Service Worker Status</h2>
            <p className='font-mono text-sm'>{swStatus}</p>
            {swDetails && <p className='text-xs text-slate-500 mt-1'>{swDetails}</p>}
          </div>

          <div>
            <h2 className='font-semibold text-lg text-slate-700'>Cached Storage ({caches.length})</h2>
            {caches.length > 0 ? (
              <ul className='list-disc list-inside text-sm text-slate-600 space-y-1'>
                {caches.map((cache) => (
                  <li key={cache} className='font-mono'>
                    {cache}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-slate-500'>No caches found</p>
            )}
          </div>

          <button onClick={clearCaches} className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'>
            Clear All Caches
          </button>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h2 className='font-semibold text-lg text-blue-800 mb-2'>Test Instructions</h2>
          <ol className='list-decimal list-inside text-sm text-blue-900 space-y-2'>
            <li>Check that Service Worker shows as &quot;Active&quot;</li>
            <li>Turn on Airplane Mode (or disconnect network)</li>
            <li>Refresh this page - it should still load</li>
            <li>Navigate to your grocery lists - they should still work</li>
            <li>Turn network back on</li>
            <li>Changes should sync automatically</li>
          </ol>
        </div>

        <div className='text-center'>
          <a href='/' className='text-indigo-600 hover:underline'>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
