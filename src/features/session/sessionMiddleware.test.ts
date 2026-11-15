import { describe, expect, it, vi } from "vitest";
import { toaster } from "#/components/ui/toaster";
import { sessionMiddleware } from "./sessionMiddleware";

vi.mock("#/components/ui/toaster", () => ({
  toaster: { create: vi.fn(), isVisible: vi.fn(() => false) },
}));

async function callWithStatus(status: number) {
  const next = vi.fn();
  const baseFetch = vi.fn(async () => new Response(null, { status }));
  // oxlint-disable-next-line typescript/no-explicit-any -- テストでは型引数の多い引数を組み立てない
  await (sessionMiddleware.options.client as any)({ next, fetch: baseFetch });
  const { fetch, headers } = next.mock.calls[0][0];
  const res = await fetch("/_serverFn/x");
  return { res, headers };
}

describe("sessionMiddleware", () => {
  it("401 ならセッション切れのトーストを出し、それ以外では出さない", async () => {
    const ok = await callWithStatus(200);
    expect(ok.headers).toEqual({ "X-Requested-With": "XMLHttpRequest" });
    expect(toaster.create).not.toHaveBeenCalled();

    const ng = await callWithStatus(401);
    expect(ng.res.status).toBe(401);
    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: "session-expired", title: "セッションが切れました" }),
    );
  });
});
