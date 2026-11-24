import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import {
  type PersistQueryClientOptions,
  persistQueryClient,
  persistQueryClientSave,
} from "@tanstack/react-query-persist-client";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { del, get, set } from "idb-keyval";
import { booksQueryKey } from "./features/books/queries";
import { routeTree } from "./routeTree.gen";

// オフライン閲覧用にキャッシュを保存しておく期間(タイマーの上限 約 24.8 日より短くする)
const twoWeeks = 1000 * 60 * 60 * 24 * 14;

export function getRouter() {
  // サーバーではリクエストごとに getRouter が呼ばれるため、キャッシュが利用者間で混ざらない
  // gcTime が保存期間より短いと保存前にメモリから消えるため、そろえる
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: twoWeeks } } });

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

  // ブラウザでのみ、登録済みの本のキャッシュを IndexedDB に保存し、次に開いたときに読み戻す
  // (読み戻しでは更新日時の新しい方が残るため、サーバーから取得した最新は上書きされない)
  if (typeof window !== "undefined") {
    const options: PersistQueryClientOptions = {
      queryClient,
      persister: createAsyncStoragePersister({
        storage: { getItem: get, setItem: set, removeItem: del },
      }),
      maxAge: twoWeeks,
      dehydrateOptions: {
        // 検索結果はオフラインで使わないため保存しない
        shouldDehydrateQuery: (query) =>
          query.queryKey[0] === booksQueryKey[0] && defaultShouldDehydrateQuery(query),
      },
    };
    // 保存はキャッシュが変わったときに行われる。サーバーから引き継いだデータは読み戻しの完了前に
    // 入っていて変化として届かないため、読み戻しの後に 1 回保存しておく
    const [, restored] = persistQueryClient(options);
    void restored.then(() => persistQueryClientSave(options));
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
