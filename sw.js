// sw.js - v4.0.0 (Fixed)
const CACHE_NAME = 'moviepicker-v4';
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
  '/manifest.json',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png'
];

// Install event - cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell...');
        // Use addAll but catch individual failures
        return Promise.allSettled(
          URLS_TO_CACHE.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('App shell cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('Navigation fetch failed, returning cached page');
          const cache = await caches.open(CACHE_NAME);
          
          // Try to get the specific page from cache
          let cachedResponse = await cache.match(event.request);
          
          // Fallback to index.html
          if (!cachedResponse) {
            cachedResponse = await cache.match('/index.html');
          }
          
          // Final fallback to root
          if (!cachedResponse) {
            cachedResponse = await cache.match('/');
          }
          
          // If nothing in cache, return a basic offline response
          if (!cachedResponse) {
            return new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          
          return cachedResponse;
        }
      })()
    );
    return;
  }
  
  // Handle static assets - cache first
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then(response => {
            // Cache the new resource
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
        })
    );
  }
});