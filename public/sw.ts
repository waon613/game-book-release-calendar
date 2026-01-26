/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

// すぐにアクティブ化
clientsClaim();

// プリキャッシュ（ビルド時に生成されるアセット）
precacheAndRoute(self.__WB_MANIFEST);

// 古いキャッシュをクリーンアップ
cleanupOutdatedCaches();

// 画像キャッシュ（Cache First - 30日間）
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
      }),
    ],
  })
);

// APIレスポンスキャッシュ（Network First - 1時間）
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("appsync-api"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1時間
      }),
    ],
  })
);

// 静的アセット（Stale While Revalidate）
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
      }),
    ],
  })
);

// 外部画像（Amazon、楽天の商品画像）
registerRoute(
  ({ url }) =>
    url.hostname.includes("amazon") ||
    url.hostname.includes("rakuten") ||
    url.hostname.includes("igdb"),
  new CacheFirst({
    cacheName: "external-images",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
      }),
    ],
  })
);

// プッシュ通知の処理
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "新着情報";
  const options: NotificationOptions = {
    body: data.body || "新しいリリース情報があります",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: data.tag || "release-notification",
    data: data.url || "/",
    actions: [
      {
        action: "open",
        title: "開く",
      },
      {
        action: "close",
        title: "閉じる",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリック処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data || "/";
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        // 既存のウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

// バックグラウンド同期（オフライン時の操作を後で同期）
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-interactions") {
    event.waitUntil(syncUserInteractions());
  }
});

async function syncUserInteractions() {
  // IndexedDBから未同期のデータを取得して送信
  // 実装は必要に応じて追加
  console.log("Syncing user interactions...");
}
