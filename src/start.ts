import { createStart } from "@tanstack/react-start";
import { sessionMiddleware } from "#/features/session/sessionMiddleware";
import { accessMiddleware } from "#/server/auth/access";

export const startInstance = createStart(() => ({
  // session: クライアントで 401 を検知 / access: サーバーで JWT を検証
  functionMiddleware: [sessionMiddleware, accessMiddleware],
}));
