const CACHE_NAME = 'ariela-v2.1'; // Changez le nom pour forcer la mise à jour
const STATIC_ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'hira.json',
  'hira.html',
  'manifest.json'
];

// 1. Installation : On ne met en cache que la structure de base (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Stratégie réseau : Network First, falling back to cache
// On cherche d'abord sur internet, si ça échoue, on regarde dans le cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, on en fait une copie dans le cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Si le réseau échoue (hors-ligne), on cherche dans le cache
        return caches.match(event.request);
      })
  );
});