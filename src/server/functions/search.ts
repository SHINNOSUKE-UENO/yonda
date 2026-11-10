import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import * as db from "#/server/db/books";
import * as googleBooks from "#/server/google-books/books";
import { type SearchResult, searchBooksInput } from "#/shared/book";

// 認証は src/start.ts のグローバル middleware で全関数に適用済み

/** 10 件ずつ検索し、登録済みかどうかを付けて返す */
export const searchBooks = createServerFn({ method: "GET" })
  .validator(searchBooksInput)
  .handler(async ({ data }): Promise<SearchResult[]> => {
    const books = await googleBooks.searchBooks(
      data.query,
      data.startIndex,
      env.GOOGLE_BOOKS_API_KEY,
    );
    if (books.length === 0) return [];

    const registered = new Set(
      await db.findRegisteredGoogleBooksIds(
        env.DB,
        books.map((book) => book.googleBooksId),
      ),
    );
    return books.map((book) => ({ ...book, registered: registered.has(book.googleBooksId) }));
  });
