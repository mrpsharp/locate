const CACHE_NAME = 'mygridref-cache-v0.1';
const urlsToCache = [
  '/index.html',
  '/style.min.css',
  '/sw.min.js',
  'script.min.js',
  '/icon.png'
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
event.respondWith(
    caches.match(event.request)
    .then(response => {
        return response || fetch(event.request);
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