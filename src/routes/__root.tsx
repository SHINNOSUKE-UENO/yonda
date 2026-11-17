import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { Provider } from "#/components/ui/provider";
import { Toaster } from "#/components/ui/toaster";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "yonda" },
    ],
    links: [
      // Access で保護されているため、ログインの Cookie を付けて取得させる
      { rel: "manifest", href: "/manifest.webmanifest", crossOrigin: "use-credentials" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // SW(src/sw.ts)はビルド時のみ生成されるため、本番だけ登録する
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    // next-themes が <html> に dark / light クラスを付けるため、ハイドレーション警告を抑止する
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* アドレスバーなどの色(bg トークンと同じ)。head() の meta は同じ name を 1 つにまとめるため直接書く */}
        <meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F0F10" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <Provider>
          {children}
          <Toaster />
        </Provider>
        <Scripts />
      </body>
    </html>
  );
}
