/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// 新しい版の SW をすぐ有効にし、開いているページも制御下に置く
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// 画面遷移: ネットワーク優先。オフラインで失敗したら保存済みの「/」を返し、後はクライアントで描画する
const pages = "pages";
registerRoute(
  new NavigationRoute(async ({ request }) => {
    try {
      const res = await fetch(request);
      // Access のログイン切れ(302)などは保存しない
      if (res.ok && new URL(request.url).pathname === "/") {
        await (await caches.open(pages)).put("/", res.clone());
      }
      return res;
    } catch {
      return (await caches.match("/", { cacheName: pages })) ?? Response.error();
    }
  }),
);

// 表紙画像: 変わらないためキャッシュ優先(検索結果の表紙も同じドメインのため一緒に入る)
const coverHosts = new Set(["books.google.com", "books.googleusercontent.com"]);
registerRoute(
  ({ request, url }) => request.destination === "image" && coverHosts.has(url.hostname),
  new CacheFirst({
    cacheName: "covers",
    plugins: [
      // CORS ヘッダーがないため中身の見えない応答(ステータス 0)になる。それも保存する
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      // 最後に使ってから時間が経ったものから消す。容量があふれたら表紙のキャッシュを捨てる(取り直せる)
      new ExpirationPlugin({ maxEntries: 200, purgeOnQuotaError: true }),
    ],
  }),
);
