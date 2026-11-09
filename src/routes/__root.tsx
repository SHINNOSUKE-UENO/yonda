import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { Provider } from "#/components/ui/provider";
import { Toaster } from "#/components/ui/toaster";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "yonda" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // next-themes が <html> に dark / light クラスを付けるため、ハイドレーション警告を抑止する
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
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
