const CACHE_NAME = 'kuberan-compass-v3.2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=3.0.0',
  './qrcode.min.js?v=3.0.0',
  './app.js?v=3.0.0',
  './manifest.webmanifest?v=3.0.0',
  './assets/images/kuberan_logo_white_bg.png',
  './assets/images/kuberan_logo_transparent.png',
  './icon.svg?v=3.0.0',
  './icon-192.png?v=3.0.0',
  './icon-512.png?v=3.0.0',
  './apple-touch-icon.png?v=3.0.0'
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
        .catch(() => caches.match('./index.html') || caches.match('./'))
    );
  } else {
    // Cache-First with Network Revalidation for assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }).catch(() => {/* offline */});

        return cachedResponse || fetchPromise;
      })
    );
  }
});
