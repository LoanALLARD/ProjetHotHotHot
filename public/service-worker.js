// Service worker
const CACHE_NAME = "hothothot-cache-v1";

// Liste des ressources à mettre en cache
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/pages/documentation.html",
  "/pages/about.html",
  "/pages/logout.html",
  "/css/style.css",
  "/css/tabs.css",
  "/css/documentation.css",
  "/js/app.js",
  "/js/temperature.js",
  "/web-socket.js",
  "/manifest.json",
  "/assets/images/logo.png",
  "/assets/images/favicon.ico",
];

// Mise en cache des ressources pour l'installation 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cache ouvert, mise en cache des ressources...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  // Force l'activation
  self.skipWaiting();
});

// Nettoyage des caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Suppression de l'ancien cache :", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prend le contrôle sur toutes les pages
  self.clients.claim();
});

// On sert d'abord depuis le cache et si la ressource n'est pas en cache on tente le réseau
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si pas en cache on va chercher sur le réseau
      return fetch(event.request).then((networkResponse) => {
        // On met en cache la nouvelle ressource
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      console.warn("[SW] Ressource non disponible :", event.request.url);
    })
  );
});
