/* Kanaku Book — minimal service worker.
   Caches the app shell so the app opens instantly (and offline).
   Bump CACHE_NAME whenever you change index.html to force an update. */

const CACHE_NAME = 'kanaku-book-v16';
const SHELL = [
  './',
  './index.html',
  './attendance.html',
  './manifest.json',
  './icon.png',
  './icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin GETs (the app shell). API calls to Apps Script
  // must always go to the network untouched.
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Network-first for the page itself, so every open shows the latest
  // version immediately; the cache is only used when offline.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((c) => c || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache-first for static assets (icons, manifest), refreshed in background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
