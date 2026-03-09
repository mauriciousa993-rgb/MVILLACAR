// Emergency Service Worker cleanup.
// This file removes old SW/caches that were serving stale index.html and old hashed assets.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.registration.unregister();

      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      clientsList.forEach((client) => {
        if ('navigate' in client) {
          client.navigate(client.url);
        }
      });
    })()
  );
});
