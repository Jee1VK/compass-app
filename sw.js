const CACHE_NAME = 'kuberan-compass-v5.1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=5.1.0',
  './style.css',
  './qrcode.min.js?v=5.1.0',
  './qrcode.min.js',
  './compass-engine.js?v=5.1.0',
  './compass-engine.js',
  './celestial-engine.js?v=5.1.0',
  './celestial-engine.js',
  './waypoint-engine.js?v=5.1.0',
  './waypoint-engine.js',
  './audio-engine.js?v=5.1.0',
  './audio-engine.js',
  './tracking-engine.js?v=5.1.0',
  './tracking-engine.js',
  './sundial-engine.js?v=5.1.0',
  './sundial-engine.js',
  './nightvision-engine.js?v=5.1.0',
  './nightvision-engine.js',
  './emf-engine.js?v=5.1.0',
  './emf-engine.js',
  './camera-hud-engine.js?v=5.1.0',
  './camera-hud-engine.js',
  './app.js?v=5.1.0',
  './app.js',
  './manifest.webmanifest?v=5.1.0',
  './manifest.webmanifest',
  './assets/images/kuberan_logo_white_bg.png',
  './assets/images/kuberan_logo_transparent.png',
  './icon.svg?v=5.1.0',
  './icon.svg',
  './icon-192.png?v=5.1.0',
  './icon-192.png',
  './icon-512.png?v=5.1.0',
  './icon-512.png',
  './apple-touch-icon.png?v=5.1.0',
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
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || 
                       (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
