// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerBook } from "#/server/functions/books";
import { searchBooks } from "#/server/functions/search";
import type { SearchResult } from "#/shared/book";
import { useBookSearch } from "./useBookSearch";

// サーバー関数の中身(Google Books・D1)は呼ばない
vi.mock("#/server/functions/search", () => ({ searchBooks: vi.fn() }));
vi.mock("#/server/functions/books", () => ({ registerBook: vi.fn() }));

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
  beforeEach(() => {
    vi.mocked(searchBooks).mockReset();
    vi.mocked(registerBook).mockReset();
  });

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

  it("さらに表示で次の 10 件を取得し、0 件が返ったら done になる", async () => {
    vi.mocked(searchBooks)
      .mockResolvedValueOnce([result("A")])
      .mockResolvedValueOnce([result("B")])
      .mockResolvedValueOnce([]);
    const { result: hook } = renderHook(() => useBookSearch("q"), { wrapper });
    await waitFor(() => expect(hook.current.loadMoreStatus).toBe("idle"));

    act(() => hook.current.loadMore());
    await waitFor(() => expect(hook.current.loadMoreStatus).toBe("loading"));
    await waitFor(() => expect(hook.current.loadMoreStatus).toBe("idle"));
    expect(hook.current.results.map((r) => r.title)).toEqual(["A", "B"]);
    expect(searchBooks).toHaveBeenLastCalledWith({ data: { query: "q", startIndex: 10 } });

    act(() => hook.current.loadMore());
    await waitFor(() => expect(hook.current.loadMoreStatus).toBe("done"));
  });

  it("登録すると、その本が登録済みになる", async () => {
    vi.mocked(searchBooks).mockResolvedValue([result("A"), result("B")]);
    vi.mocked(registerBook).mockResolvedValue({} as never);
    const { result: hook } = renderHook(() => useBookSearch("q"), { wrapper });
    await waitFor(() => expect(hook.current.status).toBe("success"));

    act(() => hook.current.register(hook.current.results[0]));

    await waitFor(() =>
      expect(hook.current.results.map((r) => r.registered)).toEqual([true, false]),
    );
    expect(registerBook).toHaveBeenCalledWith({
      data: { googleBooksId: "A", title: "A", authors: "", thumbnailUrl: null },
    });
  });
});
