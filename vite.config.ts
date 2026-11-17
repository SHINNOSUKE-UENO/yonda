import { type Plugin, defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// TanStack Start はクライアントと SSR を順にビルドし、プラグインは両方の設定を受け取る。
// vite-plugin-pwa は最後に受け取った設定(SSR)を見て SW の生成を飛ばすため、SSR の設定を渡さない
const skipSsrConfig = (plugin: Plugin): Plugin => {
  const hook = plugin.configResolved;
  if (typeof hook !== "function") return plugin;
  return {
    ...plugin,
    configResolved(config) {
      if (!config.build.ssr) return hook.call(this, config);
    },
  };
};

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact(),
    ...VitePWA({
      // SW 本体は src/sw.ts で自前。プラグインはプリキャッシュ一覧の注入とビルドのみ
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // SSR で index.html がないため、登録と manifest は自前(__root.tsx・public/)
      injectRegister: false,
      manifest: false,
      injectManifest: { globPatterns: ["**/*.{js,css,png,webmanifest}"] },
    }).map(skipSsrConfig),
  ],
});

export default config;
