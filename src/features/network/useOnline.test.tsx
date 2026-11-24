// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useOnline } from "./useOnline";

// navigator.onLine を切り替えて、ブラウザと同じくイベントを送る
const goOnline = (online: boolean) => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(online);
  window.dispatchEvent(new Event(online ? "online" : "offline"));
};

afterEach(() => vi.restoreAllMocks());

describe("useOnline", () => {
  it("オフライン・オンラインのイベントで値が切り替わる", () => {
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);

    act(() => goOnline(false));
    expect(result.current).toBe(false);

    act(() => goOnline(true));
    expect(result.current).toBe(true);
  });
});
