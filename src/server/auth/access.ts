import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

/** 全サーバー関数の先頭で通す認証(src/start.ts で一括登録) */
export const accessMiddleware = createMiddleware({ type: "function" }).server(({ next }) => {
  // ローカル開発のみ(.dev.vars)。本番の wrangler.jsonc には設定しない
  if (env.DEV_BYPASS_ACCESS === "true") return next();

  // TODO(着手順 5): Cf-Access-Jwt-Assertion を jose で検証し、正しければ next() で通す
  setResponseStatus(401);
  throw new Error("Unauthorized");
});
