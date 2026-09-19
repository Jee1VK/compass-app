const CACHE_NAME = 'kuberan-compass-v3.6.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=3.6.0',
  './style.css',
  './qrcode.min.js?v=3.6.0',
  './qrcode.min.js',
  './app.js?v=3.6.0',
  './app.js',
  './manifest.webmanifest?v=3.6.0',
  './manifest.webmanifest',
  './assets/images/kuberan_logo_white_bg.png',
  './assets/images/kuberan_logo_transparent.png',
  './icon.svg?v=3.6.0',
  './icon.svg',
  './icon-192.png?v=3.6.0',
  './icon-192.png',
  './icon-512.png?v=3.6.0',
  './icon-512.png',
  './apple-touch-icon.png?v=3.6.0',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Delete ALL older caches
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || 
                       (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    // Network-First for HTML/Navigation: Always fetch newest online, fallback to cache offline
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          const indexMatch = await caches.match('./index.html');
          if (indexMatch) return indexMatch;
          const rootMatch = await caches.match('./');
          if (rootMatch) return rootMatch;
          return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>KUBERAN Compass App is Offline</h1></body></html>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
  } else {
    // Cache-First with Network Revalidation for assets
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }).catch(() => {/* offline fallback */});

        return cachedResponse || fetchPromise;
      })
    );
  }
});
