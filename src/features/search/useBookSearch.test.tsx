// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchBooks } from "#/server/functions/search";
import type { SearchResult } from "#/shared/book";
import { useBookSearch } from "./useBookSearch";

// サーバー関数の中身(Google Books・D1)は呼ばない
vi.mock("#/server/functions/search", () => ({ searchBooks: vi.fn() }));

const result = (title: string): SearchResult => ({
  googleBooksId: title,
  title,
  authors: "",
  thumbnailUrl: null,
  registered: false,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("useBookSearch", () => {
  beforeEach(() => vi.mocked(searchBooks).mockReset());

  it("検索ワードが空なら取得しない", () => {
    const { result: hook } = renderHook(() => useBookSearch(""), { wrapper });

    expect(hook.current.status).toBe("initial");
    expect(searchBooks).not.toHaveBeenCalled();
  });

  it("検索ワードがあれば先頭 10 件を取得して返す", async () => {
    vi.mocked(searchBooks).mockResolvedValue([result("A"), result("B")]);

    const { result: hook } = renderHook(() => useBookSearch("村上春樹"), { wrapper });

    await waitFor(() => expect(hook.current.status).toBe("success"));
    expect(hook.current.results.map((r) => r.title)).toEqual(["A", "B"]);
    expect(searchBooks).toHaveBeenCalledWith({ data: { query: "村上春樹", startIndex: 0 } });
  });
});
