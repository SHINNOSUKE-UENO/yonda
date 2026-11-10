// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Book } from "#/shared/book";
import { useShelfTable } from "./useShelfTable";

const book = (title: string, fields: Partial<Book>): Book => ({
  id: title,
  googleBooksId: title,
  title,
  authors: "",
  thumbnailUrl: null,
  readDate: "2026-01-01",
  memo: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...fields,
});

const books = [
  book("A", { readDate: "2026-10-01", authors: "さとう", createdAt: "2026-01-01T00:00:00.000Z" }),
  book("B", { readDate: "2026-11-01", authors: "あべ", createdAt: "2026-03-01T00:00:00.000Z" }),
  // カタカナは文字コード順だとひらがなより後ろになるため、五十音順の確認に使う
  book("C", { readDate: "2026-09-01", authors: "カトウ", createdAt: "2026-02-01T00:00:00.000Z" }),
];

const titles = (result: { current: ReturnType<typeof useShelfTable> }) =>
  result.current.books.map((b) => b.title);

describe("useShelfTable", () => {
  it("初期状態は読了日が新しい順に並び、総数を返す", () => {
    const { result } = renderHook(() => useShelfTable(books));

    expect(titles(result)).toEqual(["B", "A", "C"]);
    expect(result.current.total).toBe(3);
  });

  it("並び替えを変えると、その順に並ぶ(著者順は五十音順)", () => {
    const { result } = renderHook(() => useShelfTable(books));

    act(() => result.current.setSort("authors-asc"));
    expect(titles(result)).toEqual(["B", "C", "A"]);

    act(() => result.current.setSort("createdAt-asc"));
    expect(titles(result)).toEqual(["A", "C", "B"]);
  });
});
