/**
 * Service Worker FrikChange (PWA)
 * Gestion du cache hors-ligne et conformité installation Android / PWA
 */

const CACHE_NAME = 'frikchange-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon.svg',
  '/apple-touch-icon.png'
];

// 1. Installation : mise en cache des assets essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pré-cache partiel:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activation : purge des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interception des requêtes réseau (Stratégie Network-First avec fallback Cache)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // On ignore les requêtes non-GET et les requêtes vers des protocoles non supportés (ex: chrome-extension)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Ne pas cacher les appels API dynamiques (taux de change, paiements Chariow, Google Sheets)
  const isApiRequest = request.url.includes('api.chariow.com') ||
                       request.url.includes('open.er-api.com') ||
                       request.url.includes('script.google.com') ||
                       request.url.includes('quickchart.io');

  if (isApiRequest) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Réseau indisponible hors-ligne' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // Pour les pages et ressources statiques : réseau en premier, puis cache si hors-ligne
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback pour la navigation HTML
        if (request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return new Response('Contenu indisponible hors-ligne', { status: 503 });
      })
  );
});
