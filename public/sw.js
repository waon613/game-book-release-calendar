/**
 * Service Worker for ゲーム＆書籍リリースカレンダー
 * オフライン対応、キャッシュ戦略、プッシュ通知
 */

const CACHE_NAME = 'release-calendar-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// キャッシュする静的リソース
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// キャッシュ戦略
const CACHE_STRATEGIES = {
  // 静的アセット: Cache First
  static: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },
  
  // API: Network First with Cache Fallback
  api: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response(JSON.stringify({ error: 'Offline', items: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  // 動的コンテンツ: Stale While Revalidate
  dynamic: async (request) => {
    const cached = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    
    return cached || await fetchPromise || new Response('Offline', { status: 503 });
  }
};

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.includes('v1'))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// フェッチリクエストの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) return;
  
  // API リクエスト
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.api(request));
    return;
  }
  
  // 静的アセット
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(CACHE_STRATEGIES.static(request));
    return;
  }
  
  // その他（HTML, JS等）
  event.respondWith(CACHE_STRATEGIES.dynamic(request));
});

// プッシュ通知
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'リリース情報があります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: '開く' },
      { action: 'close', title: '閉じる' },
    ],
    tag: data.tag || 'release-notification',
    renotify: true,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'リリースカレンダー', options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // オフライン時に保存されたお気に入りをサーバーと同期
  console.log('Syncing favorites...');
}

// 定期的なバックグラウンドフェッチ（対応ブラウザのみ）
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-releases') {
    event.waitUntil(checkNewReleases());
  }
});

async function checkNewReleases() {
  try {
    const response = await fetch('/api/releases?check=true');
    const data = await response.json();
    
    if (data.newReleases && data.newReleases.length > 0) {
      self.registration.showNotification('新着リリース情報', {
        body: `${data.newReleases.length}件の新しいリリース情報があります`,
        icon: '/icons/icon-192x192.png',
        data: { url: '/' },
      });
    }
  } catch (error) {
    console.error('Failed to check new releases:', error);
  }
}
