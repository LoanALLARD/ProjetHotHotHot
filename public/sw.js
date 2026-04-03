const CACHE_NAME = 'hothothot-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/documentation.html', 
  '/css/style.css',
  '/js/app.js',
  '/js/temperature.js'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});