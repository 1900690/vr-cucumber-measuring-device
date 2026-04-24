const CACHE_NAME = 'cucumber-vr-v1';

// アプリの基本的なファイルを最初にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 通信が発生するたびに、そのファイルをキャッシュに保存する（動的キャッシュ）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあればそれを返す（オフライン時はここが呼ばれる）
      if (cachedResponse) {
        return cachedResponse;
      }

      // キャッシュがない場合はインターネットから取得し、キャッシュに保存する
      return fetch(event.request).then((response) => {
        // 有効なレスポンスのみキャッシュ
        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        console.error('オフラインのため通信できません:', event.request.url);
      });
    })
  );
});
