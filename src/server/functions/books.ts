import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import * as db from "#/server/db/books";
import { bookIdInput, registerBookInput, updateBookInput } from "#/shared/book";

// 認証は src/start.ts のグローバル middleware で全関数に適用済み

export const listBooks = createServerFn({ method: "GET" }).handler(() => db.listBooks(env.DB));

export const getBook = createServerFn({ method: "GET" })
  .validator(bookIdInput)
  .handler(async ({ data }) => {
    const book = await db.getBook(env.DB, data.id);
    if (!book) throw notFound();
    return book;
  });

export const registerBook = createServerFn({ method: "POST" })
  .validator(registerBookInput)
  .handler(({ data }) => db.registerBook(env.DB, data));

export const updateBook = createServerFn({ method: "POST" })
  .validator(updateBookInput)
  .handler(async ({ data }) => {
    const book = await db.updateBook(env.DB, data);
    if (!book) throw notFound();
    return book;
  });

export const deleteBook = createServerFn({ method: "POST" })
  .validator(bookIdInput)
  .handler(({ data }) => db.deleteBook(env.DB, data.id));
