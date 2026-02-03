'use client';

import { useState, useEffect } from 'react';
import { useShouldShowApp } from '@/lib/hooks/useShouldShowApp';
import { setLocalStorageItem } from '@/lib/utils/storage';

export default function InstallPrompt() {
  const isStandalone = useShouldShowApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleBypassInstall = () => {
    setLocalStorageItem('bypass-install', 'true');
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new Event('bypass-install'));
  };

  if (isStandalone) {
    return null; // App is installed, show main content
  }

  return (
    <div className='bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-700 dark:to-indigo-900 min-h-screen flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        {/* App Icon */}
        <div className='text-center mb-8'>
          <div className='w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl mx-auto mb-6 flex items-center justify-center'>
            <span className='text-5xl'>🛒</span>
          </div>
          <h1 className='text-4xl font-bold text-white mb-2'>Groceries</h1>
          <p className='text-indigo-100 dark:text-indigo-200'>Grocery list tracker</p>
        </div>

        {/* Features */}
        <div className='bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20'>
          <div className='space-y-4'>
            <Feature icon='☁️' title='Cloud Sync' description='Lahat updated, kahit nasa CR ka' />
            <Feature icon='✓' title='Quick Actions' description='Bulk add/remove. Kasi tamad tayo lahat.' />
          </div>
        </div>

        {/* Install Instructions */}
        <div className='bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800'>
          {isIOS ? (
            <div className='space-y-4'>
              <h3 className='font-semibold text-slate-900 dark:text-white text-lg text-center mb-6'>
                📱 How to Install (iPhone/iPad)
              </h3>

              {/* Step 1 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  1
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-slate-900 dark:text-white font-medium mb-2'>
                    Tap the <strong className='text-indigo-600 dark:text-indigo-400'>Share</strong> button
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>Look for the square with an arrow pointing up ⬆️</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  2
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-slate-900 dark:text-white font-medium mb-2'>
                    Scroll down and find{' '}
                    <strong className='text-indigo-600 dark:text-indigo-400'>&quot;Add to Home Screen&quot;</strong>
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>It has a plus ➕ icon next to it</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  3
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-slate-900 dark:text-white font-medium mb-2'>
                    Tap <strong className='text-indigo-600 dark:text-indigo-400'>&quot;Add&quot;</strong> in the top right
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>The app will now appear on your home screen! 🎉</p>
                </div>
              </div>
            </div>
          ) : isAndroid && deferredPrompt ? (
            <div className='space-y-4'>
              <h3 className='font-semibold text-slate-900 dark:text-white text-lg text-center mb-6'>📱 Install on Android</h3>

              <div className='bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-6 text-center border border-indigo-200 dark:border-indigo-900/50'>
                <p className='text-2xl mb-3'>👇</p>
                <p className='text-slate-700 dark:text-slate-300 mb-4'>
                  Tap the button below to add this app to your home screen
                </p>
                <button
                  onClick={handleInstallClick}
                  className='w-full py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-98 text-white font-semibold rounded-2xl transition-all shadow-lg text-lg'
                >
                  ➕ Install App
                </button>
              </div>

              <div className='text-center'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  After installation, find the app on your home screen with the 🛒 icon
                </p>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <h3 className='font-semibold text-slate-900 dark:text-white text-lg text-center mb-6'>📱 How to Install</h3>

              {isAndroid ? (
                <div className='space-y-4'>
                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      1
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-slate-900 dark:text-white font-medium mb-2'>
                        Tap the <strong className='text-indigo-600 dark:text-indigo-400'>menu</strong> button
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Look for three dots ⋮ in the top corner of your browser
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      2
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-slate-900 dark:text-white font-medium mb-2'>
                        Select <strong className='text-indigo-600 dark:text-indigo-400'>&quot;Add to Home screen&quot;</strong>
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Or &quot;Install app&quot; depending on your browser
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      3
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-slate-900 dark:text-white font-medium mb-2'>
                        Tap <strong className='text-indigo-600 dark:text-indigo-400'>&quot;Install&quot;</strong> or{' '}
                        <strong className='text-indigo-600 dark:text-indigo-400'>&quot;Add&quot;</strong>
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>The app will appear on your home screen! 🎉</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-slate-600 dark:text-slate-400 mb-4'>
                    To install this app, please use your phone&apos;s browser and look for the option to add to home screen.
                  </p>
                  <p className='text-sm text-slate-500 dark:text-slate-500'>
                    Usually found in the browser&apos;s menu (⋮) or share button
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-indigo-100 dark:text-indigo-200 mb-3'>
            Need help? Ask a family member or check your phone&apos;s manual
          </p>
          <button
            onClick={handleBypassInstall}
            className='text-xs text-indigo-200 dark:text-indigo-300 hover:text-white underline opacity-60 hover:opacity-100 transition-opacity'
          >
            Continue in Browser
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className='flex items-start gap-4'>
      <div className='w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl'>
        {icon}
      </div>
      <div>
        <h4 className='font-semibold text-white text-sm'>{title}</h4>
        <p className='text-indigo-100 dark:text-indigo-200 text-xs'>{description}</p>
      </div>
    </div>
  );
}
