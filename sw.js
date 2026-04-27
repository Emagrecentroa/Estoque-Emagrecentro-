/* Service Worker — Controle de Estoque
   Estratégia:
   - Cache first para shell do app (HTML, manifest, ícones)
   - Cache first com revalidação em background para CDN externa (ZXing, fontes)
   - Atualização automática quando nova versão é publicada
*/

const CACHE_VERSION = 'v1.0.0';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Strategy 1: Same-origin requests → cache first, fallback to network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback for navigation
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
    return;
  }

  // Strategy 2: External resources (CDN: fonts, ZXing) → stale-while-revalidate
  if (
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Default: just fetch
});

// Listen for messages (manual update trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
