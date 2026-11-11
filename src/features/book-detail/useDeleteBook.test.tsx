// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { booksQueryKey } from "#/features/books/queries";
import { deleteBook } from "#/server/functions/books";
import type { Book } from "#/shared/book";
import { useDeleteBook } from "./useDeleteBook";

// サーバー関数の中身(D1)は呼ばない
vi.mock("#/server/functions/books", () => ({ deleteBook: vi.fn() }));
const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));

const book = (id: string) => ({ id }) as Book;

it("削除すると本棚の一覧から取り除き、本棚へ移動して詳細のキャッシュを消す", async () => {
  vi.mocked(deleteBook).mockResolvedValue(undefined);
  const queryClient = new QueryClient();
  queryClient.setQueryData(booksQueryKey, [book("a"), book("b")]);
  queryClient.setQueryData([...booksQueryKey, "a"], book("a"));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useDeleteBook("a"), { wrapper });
  act(() => result.current.remove());

  await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: "/" }));
  expect(queryClient.getQueryData<Book[]>(booksQueryKey)).toEqual([book("b")]);
  expect(queryClient.getQueryData([...booksQueryKey, "a"])).toBeUndefined();
});
