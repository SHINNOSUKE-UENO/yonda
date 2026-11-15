import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // サーバーではリクエストごとに getRouter が呼ばれるため、キャッシュが利用者間で混ざらない
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    // loader から queryClient を使えるようにする
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    // 鮮度の管理は TanStack Query に任せる(Router 側で loader を毎回呼び直さない)
    defaultPreloadStaleTime: 0,
  });

  // サーバーで取得したキャッシュをクライアントへ引き継ぎ、QueryClientProvider で包む
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
