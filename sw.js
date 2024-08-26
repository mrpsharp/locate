const CACHE_NAME = 'mygridref-cache-v0.6';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.min.css',
  '/sw.min.js',
  '/script.min.js',
  '/os-transform.min.js',
  '/icon-sml.png',
  '/proj4.js',
  '/manifest.json',
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(urlsToCache);
        })
    );
  });

//  Fetching Assets
self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url); // Log the URL of the request

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('Found in cache:', event.request.url); // Log if the response is found in the cache
        return response;
      }

      console.log('Not found in cache, fetching from network:', event.request.url); // Log if the response is not in the cache
      return fetch(event.request).then(networkResponse => {
        // Optionally, cache the new response here
        return networkResponse;
      }).catch(error => {
        console.error('Fetching failed:', event.request.url, error); // Log any errors during the network request
        throw error; // Re-throw the error to ensure it propagates
      });
    })
  );
});


// Clean up old caches
self.addEventListener('activate', event => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
    caches.keys().then(cacheNames => {
    return Promise.all(
        cacheNames.map(cacheName => {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
        }
        })
    );
    })
);
});