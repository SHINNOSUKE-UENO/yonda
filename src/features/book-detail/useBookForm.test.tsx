// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookQuery, booksQueryKey } from "#/features/books/queries";
import { updateBook } from "#/server/functions/books";
import type { Book } from "#/shared/book";
import { useBookForm } from "./useBookForm";

// サーバー関数の中身(D1)は呼ばない
vi.mock("#/server/functions/books", () => ({ updateBook: vi.fn() }));

const book: Book = {
  id: "11111111-1111-4111-8111-111111111111",
  googleBooksId: "g1",
  title: "火花",
  authors: "又吉直樹",
  thumbnailUrl: null,
  readDate: "2026-10-15",
  memo: "",
  createdAt: "2026-10-15T00:00:00.000Z",
  updatedAt: "2026-10-15T00:00:00.000Z",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("useBookForm", () => {
  beforeEach(() => vi.mocked(updateBook).mockReset());

  it("変更がなければ保存できず、変更すると保存できる", () => {
    const { result } = renderHook(() => useBookForm(book), { wrapper });
    expect(result.current.canSave).toBe(false);

    act(() => result.current.setMemo("再読したい"));
    expect(result.current.canSave).toBe(true);
  });

  it("読了日が空のまま保存するとエラーを出し、送信しない", () => {
    const { result } = renderHook(() => useBookForm(book), { wrapper });

    act(() => result.current.setReadDate(""));
    act(() => result.current.save());

    expect(result.current.readDateError).toBe("読了日を入力してください");
    expect(updateBook).not.toHaveBeenCalled();
  });

  it("保存すると、返ってきた本で詳細と一覧のキャッシュを置き換える", async () => {
    const updated = { ...book, memo: "再読したい" };
    vi.mocked(updateBook).mockResolvedValue(updated);
    const other = { ...book, id: "22222222-2222-4222-8222-222222222222" };
    const queryClient = new QueryClient();
    queryClient.setQueryData(booksQueryKey, [book, other]);
    queryClient.setQueryData(bookQuery(book.id).queryKey, book);
    const { result } = renderHook(() => useBookForm(book), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    act(() => result.current.setMemo("再読したい"));
    act(() => result.current.save());

    await waitFor(() =>
      expect(queryClient.getQueryData(bookQuery(book.id).queryKey)).toEqual(updated),
    );
    expect(queryClient.getQueryData(booksQueryKey)).toEqual([updated, other]);
  });
});
