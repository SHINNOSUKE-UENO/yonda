import { createMiddleware } from "@tanstack/react-start";
import { toaster } from "#/components/ui/toaster";

const toastId = "session-expired";

/**
 * Access のセッション切れを検知して、再読み込みを促す(クライアント側のみ)。
 * X-Requested-With を付けると、Access はログイン画面への 302 ではなく 401 を返す。
 * サーバー側の JWT 検証で拒否された場合も 401 になる。
 */
export const sessionMiddleware = createMiddleware({ type: "function" }).client(
  ({ next, fetch: baseFetch = fetch }) =>
    next({
      headers: { "X-Requested-With": "XMLHttpRequest" },
      fetch: async (...args) => {
        const res = await baseFetch(...args);
        // 同時に複数の通信が失敗しても、トーストは 1 つだけ出す
        if (res.status === 401 && !toaster.isVisible(toastId)) {
          toaster.create({
            id: toastId,
            type: "warning",
            title: "セッションが切れました",
            description: "再読み込みしてログインし直してください",
            duration: Infinity,
            action: { label: "再読み込み", onClick: () => location.reload() },
          });
        }
        return res;
      },
    }),
);
