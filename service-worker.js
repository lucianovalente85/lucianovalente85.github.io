self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing and caching static files...');
  event.waitUntil(
    caches.open('static-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
        // outros arquivos essenciais
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');
});

self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetching:', event.request.url);

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Conteúdo encontrado no cache
      if (cachedResponse) {
        console.log('[ServiceWorker] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Não encontrado no cache, buscar da rede
      return fetch(event.request)
        .then(networkResponse => {
          return caches.open('dynamic-cache-v1').then(cache => {
            // Cachear a nova resposta para uso futuro
            cache.put(event.request, networkResponse.clone());
            console.log('[ServiceWorker] New content cached:', event.request.url);
            return networkResponse;
          });
        })
        .catch(error => {
          console.log('[ServiceWorker] Offline - Failed to fetch:', event.request.url);
          return new Response('Offline mode: resource not available.', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});