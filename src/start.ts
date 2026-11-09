import { createStart } from "@tanstack/react-start";
import { accessMiddleware } from "#/server/auth/access";

export const startInstance = createStart(() => ({
  functionMiddleware: [accessMiddleware],
}));
