'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = (window.navigator as any).standalone || standalone;

    setIsStandalone(isInStandaloneMode);

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

  if (isStandalone) {
    return null; // App is installed, show nothing
  }

  return (
    <div className='fixed inset-0 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 z-50 flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        {/* App Icon */}
        <div className='text-center mb-8'>
          <div className='w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mx-auto mb-6 flex items-center justify-center'>
            <span className='text-5xl'>🛒</span>
          </div>
          <h1 className='text-4xl font-bold text-white mb-2'>Groceries</h1>
          <p className='text-blue-100 dark:text-blue-200'>Smart grocery list tracker</p>
        </div>

        {/* Features */}
        <div className='bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-3xl p-6 mb-6'>
          <div className='space-y-4'>
            <Feature icon='☁️' title='Cloud Sync' description='Access your list from any device' />
            <Feature icon='📱' title='Offline Mode' description='Works without internet' />
            <Feature icon='✓' title='Quick Actions' description='Multi-select and bulk operations' />
          </div>
        </div>

        {/* Install Instructions */}
        <div className='bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl'>
          {isIOS ? (
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900 dark:text-white text-lg text-center mb-6'>
                📱 How to Install (iPhone/iPad)
              </h3>

              {/* Step 1 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  1
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-gray-900 dark:text-white font-medium mb-2'>
                    Tap the <strong className='text-blue-600 dark:text-blue-400'>Share</strong> button
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Look for the square with an arrow pointing up ⬆️ at the bottom of your screen
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  2
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-gray-900 dark:text-white font-medium mb-2'>
                    Scroll down and find{' '}
                    <strong className='text-blue-600 dark:text-blue-400'>&quot;Add to Home Screen&quot;</strong>
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>It has a plus ➕ icon next to it</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='flex gap-4 items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                  3
                </div>
                <div className='flex-1 pt-2'>
                  <p className='text-gray-900 dark:text-white font-medium mb-2'>
                    Tap <strong className='text-blue-600 dark:text-blue-400'>&quot;Add&quot;</strong> in the top right
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>The app will now appear on your home screen! 🎉</p>
                </div>
              </div>

              <div className='pt-4 border-t border-gray-200 dark:border-gray-700 mt-6'>
                <div className='bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4'>
                  <div className='flex gap-3'>
                    <span className='text-2xl'>⚠️</span>
                    <div>
                      <p className='text-sm font-medium text-amber-900 dark:text-amber-200 mb-1'>Important for iPhone users:</p>
                      <p className='text-xs text-amber-800 dark:text-amber-300'>
                        You must use <strong>Safari browser</strong> (the blue compass icon). This won&apos;t work in Chrome or
                        other browsers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isAndroid && deferredPrompt ? (
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900 dark:text-white text-lg text-center mb-6'>📱 Install on Android</h3>

              <div className='bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center'>
                <p className='text-2xl mb-3'>👇</p>
                <p className='text-gray-700 dark:text-gray-300 mb-4'>Tap the button below to add this app to your home screen</p>
                <button
                  onClick={handleInstallClick}
                  className='w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-98 text-white font-semibold rounded-2xl transition-all shadow-lg text-lg'
                >
                  ➕ Install App
                </button>
              </div>

              <div className='text-center'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  After installation, find the app on your home screen with the 🛒 icon
                </p>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900 dark:text-white text-lg text-center mb-6'>📱 How to Install</h3>

              {isAndroid ? (
                <div className='space-y-4'>
                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      1
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-gray-900 dark:text-white font-medium mb-2'>
                        Tap the <strong className='text-blue-600 dark:text-blue-400'>menu</strong> button
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Look for three dots ⋮ in the top corner of your browser
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      2
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-gray-900 dark:text-white font-medium mb-2'>
                        Select <strong className='text-blue-600 dark:text-blue-400'>&quot;Add to Home screen&quot;</strong>
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Or &quot;Install app&quot; depending on your browser
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4 items-start'>
                    <div className='flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg'>
                      3
                    </div>
                    <div className='flex-1 pt-2'>
                      <p className='text-gray-900 dark:text-white font-medium mb-2'>
                        Tap <strong className='text-blue-600 dark:text-blue-400'>&quot;Install&quot;</strong> or{' '}
                        <strong className='text-blue-600 dark:text-blue-400'>&quot;Add&quot;</strong>
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>The app will appear on your home screen! 🎉</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    To install this app, please use your phone&apos;s browser and look for the option to add to home screen.
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-500'>
                    Usually found in the browser&apos;s menu (⋮) or share button
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-blue-100 dark:text-blue-200'>
            Need help? Ask a family member or check your phone&apos;s manual
          </p>
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
        <p className='text-blue-100 dark:text-blue-200 text-xs'>{description}</p>
      </div>
    </div>
  );
}
