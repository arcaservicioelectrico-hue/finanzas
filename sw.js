/**
 * SW.JS
 * Service Worker para funcionalidad PWA y modo offline
 */

const CACHE_VERSION = 'finanzas-v2-1.0.0';
const CACHE_NAME = `${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

// Archivos a cachear al instalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/dark.css',
  '/js/utils.js',
  '/js/storage.js',
  '/js/ui.js',
  '/js/dashboard.js',
  '/js/movements.js',
  '/js/investments.js',
  '/js/goals.js',
  '/js/calculator.js',
  '/js/charts.js',
  '/js/reports.js',
  '/js/firebase.js',
  '/js/app.js'
];

/**
 * Evento: Install
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[SW] Some assets failed to cache:', err);
        // Continuar aunque algunos fallen
        return cache.addAll(STATIC_ASSETS.filter((asset, index) => index < 5));
      });
    })
  );

  self.skipWaiting();
});

/**
 * Evento: Activate
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.includes(RUNTIME_CACHE)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/**
 * Evento: Fetch
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests a extensiones
  if (request.url.includes('chrome-extension')) {
    return;
  }

  // Estrategia: Cache first, fallback to network
  if (isAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  }
  // Estrategia: Network first, fallback to cache (para datos)
  else if (isApi(request.url)) {
    event.respondWith(networkFirst(request));
  }
  // Estrategia: Stale while revalidate (documentos HTML)
  else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Determinar si es un asset
 */
function isAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/.test(url);
}

/**
 * Determinar si es una API
 */
function isApi(url) {
  return url.includes('/api/') || url.includes('firebase');
}

/**
 * Estrategia: Cache First
 */
async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const response = await cache.match(request);

  if (response) {
    return response;
  }

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] Fetch failed:', error);
    return new Response('Recurso no disponible', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Estrategia: Network First
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', error);
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Sin conexión', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Estrategia: Stale While Revalidate
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  return cachedResponse || fetchPromise;
}

/**
 * Mensaje desde el cliente
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});

/**
 * Background Sync (para sincronización en background)
 */
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(
        // Sincronizar datos cuando haya conexión
        fetch('/api/sync', { method: 'POST' })
          .then(() => {
            console.log('[SW] Data synced successfully');
          })
          .catch((err) => {
            console.log('[SW] Sync failed:', err);
            // Reintentar después
            return self.registration.sync.register('sync-data');
          })
      );
    }
  });
}

/**
 * Periodic Background Sync (sincronización periódica)
 */
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-prices') {
      event.waitUntil(
        fetch('/api/update-prices', { method: 'POST' })
          .then(() => {
            console.log('[SW] Prices updated');
          })
          .catch((err) => {
            console.log('[SW] Price update failed:', err);
          })
      );
    }
  });
}

console.log('[SW] Service Worker loaded');
