// Grocery List Tracker - Service Worker
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `grocery-list-tracker-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = ['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control of all clients
      }),
  );
});

// Fetch event - network first, cache fallback strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    // Let Firebase requests go through
    if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com')) {
      event.respondWith(
        fetch(request).catch(() => {
          console.log('[Service Worker] Firebase request failed offline:', url.href);
          return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          });
        }),
      );
    }
    return;
  }

  // Skip API routes - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      }),
    );
    return;
  }

  // Network-first strategy for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[Service Worker] Serving from cache (offline):', url.pathname);
            return cached;
          }

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/').then((cachedHome) => {
              if (cachedHome) return cachedHome;

              // Fallback offline response
              return new Response(
                '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                {
                  headers: { 'Content-Type': 'text/html' },
                  status: 503,
                },
              );
            });
          }

          // For other requests, return a generic offline response
          return new Response('Offline', { status: 503 });
        });
      }),
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-grocery-lists') {
    event.waitUntil(
      // Sync logic would go here
      Promise.resolve(),
    );
  }
});

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Grocery List Update';
  const options = {
    body: data.body || 'Your grocery list has been updated',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});

console.log('[Service Worker] Loaded successfully');
