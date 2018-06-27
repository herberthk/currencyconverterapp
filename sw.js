let cacheName = 'currency_converter-v1',
  dataCacheName = 'currency_data-v1',
  filesToCache = ['/',
    '/js/app.js',
    '/js/localforage-1.7.2.min.js'
  ];
const curencyApiUrl = 'https://free.currencyconverterapi.com/api/v5/';

self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', (e) => {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.startsWith(curencyApiUrl)) {
    e.respondWith(
      fetch(e.request)
      .then((response) => {
        return caches.open(dataCacheName).then((cache) => {
          cache.put(e.request.url, response.clone());
          console.log('[ServiceWorker] Fetched & Cached', e.request.url);
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => {
        console.log('[ServiceWorker] Fetch Only', e.request.url);
        return response || fetch(e.request);
      })
    );
  }
});