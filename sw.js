// sw.js - v5.0.0 (Full Optimization with API Caching)
const CACHE_NAME = 'moviepicker-v5';
const API_CACHE_NAME = 'moviepicker-api-v1';
const API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/config.js',
  '/helpers.js',
  '/hooks.js',
  '/app.js',
  '/components.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        return Promise.allSettled(
          URLS_TO_CACHE.map(url => 
            cache.add(url).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err.message))
          )
        );
      })
      .then(() => {
        console.log('[SW] App shell cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (!validCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Check if request is an API call
function isApiRequest(url) {
  return url.includes('api.themoviedb.org') || 
         url.includes('api.igdb.com') ||
         url.includes('image.tmdb.org');
}

// Check if cached response is still valid
function isCacheValid(response) {
  if (!response) return false;
  const cachedTime = response.headers.get('sw-cached-time');
  if (!cachedTime) return true; // No timestamp means it's a static asset
  return (Date.now() - parseInt(cachedTime)) < API_CACHE_DURATION;
}

// Fetch event handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          console.log('[SW] Navigation failed, serving from cache');
          const cache = await caches.open(CACHE_NAME);
          return await cache.match('/index.html') || 
                 await cache.match('/') ||
                 new Response('<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>', 
                   { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // Handle TMDB images - Cache first, network fallback
  if (url.hostname.includes('image.tmdb.org')) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(API_CACHE_NAME).then(cache => cache.put(request, clone));
            }
            return response;
          }).catch(() => {
            // Return placeholder for failed images
            return new Response('', { status: 404 });
          });
        })
    );
    return;
  }

  // Handle API requests - Stale-while-revalidate
  if (isApiRequest(url.href)) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(request);
        
        // Fetch fresh data in background
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            // Clone and add timestamp header
            const headers = new Headers(networkResponse.headers);
            headers.set('sw-cached-time', Date.now().toString());
            
            const responseToCache = new Response(networkResponse.clone().body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: headers
            });
            cache.put(request, responseToCache);
          }
          return networkResponse;
        }).catch(err => {
          console.log('[SW] API fetch failed:', err.message);
          return null;
        });

        // Return cached if valid, otherwise wait for network
        if (cachedResponse && isCacheValid(cachedResponse)) {
          // Return stale data immediately, update in background
          fetchPromise; // Fire and forget
          return cachedResponse;
        }

        // No cache or expired - wait for network
        const networkResponse = await fetchPromise;
        if (networkResponse) return networkResponse;
        
        // Network failed, return stale cache if available
        if (cachedResponse) {
          console.log('[SW] Returning stale cache for:', url.pathname);
          return cachedResponse;
        }

        // Nothing available
        return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle static assets - Cache first
  if (request.url.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearApiCache') {
    caches.delete(API_CACHE_NAME).then(() => {
      console.log('[SW] API cache cleared');
    });
  }
});