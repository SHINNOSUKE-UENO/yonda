/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

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
