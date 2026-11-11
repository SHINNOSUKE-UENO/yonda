import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader, setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { createRemoteJWKSet } from "jose";
import { isValidAccessToken } from "./verify";

// 公開鍵はリクエストをまたいで使い回す(jose が取得結果をキャッシュし、鍵の更新時は取り直す)
let keys: ReturnType<typeof createRemoteJWKSet> | undefined;
const getKeys = () =>
  (keys ??= createRemoteJWKSet(new URL("/cdn-cgi/access/certs", env.CF_ACCESS_TEAM_DOMAIN)));

/** 全サーバー関数の先頭で通す認証(src/start.ts で一括登録) */
export const accessMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  // ローカル開発のみ(.dev.vars)。本番の wrangler.jsonc には設定しない
  if (env.DEV_BYPASS_ACCESS === "true") return next();

  const valid = await isValidAccessToken(getRequestHeader("cf-access-jwt-assertion"), {
    issuer: env.CF_ACCESS_TEAM_DOMAIN,
    audience: env.CF_ACCESS_AUD,
    keys: getKeys(),
  });
  if (!valid) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }
  return next();
});
