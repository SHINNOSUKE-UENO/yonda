import { describe, expect, it } from "vitest";
import { toSearchBook } from "./books";

describe("toSearchBook", () => {
  it("著者を「、」でつなぎ、表紙 URL を https にする", () => {
    expect(
      toSearchBook({
        id: "abc",
        volumeInfo: {
          title: "火花",
          authors: ["又吉直樹", "著者2"],
          imageLinks: { thumbnail: "http://books.google.com/books/content?id=abc" },
        },
      }),
    ).toEqual({
      googleBooksId: "abc",
      title: "火花",
      authors: "又吉直樹、著者2",
      thumbnailUrl: "https://books.google.com/books/content?id=abc",
    });
  });

  it("著者・表紙がない場合は空文字・null にする", () => {
    expect(toSearchBook({ id: "xyz", volumeInfo: { title: "無名の本" } })).toEqual({
      googleBooksId: "xyz",
      title: "無名の本",
      authors: "",
      thumbnailUrl: null,
    });
  });
});
