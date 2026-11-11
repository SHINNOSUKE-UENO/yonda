// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
});
