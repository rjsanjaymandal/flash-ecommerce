const CACHE_NAME = 'flash-cache-v1';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/flash-logo.jpg',
  '/hero-banner.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force cache offline page during install
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy 1: Cache First for Images/Fonts/Assets
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2)$/i) ||
    url.pathname.startsWith('/_next/static')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
               // Only cache successful responses
               if (response.ok) {
                 cache.put(event.request, responseClone);
               }
            });
            return response;
          })
        );
      })
    );
    return;
  }

  // Strategy 2: Network First for Navigation (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Strategy 3: Network First (Stale While Revalidate logic unused for simplicity)
  // For API calls, we stick to network mainly, or let standard browser cache handle it.
});
