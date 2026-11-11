import { queryOptions } from "@tanstack/react-query";
import { listBooks } from "#/server/functions/books";

/** 登録済みの本のキャッシュは "books" から始まるキーにそろえ、更新時はまとめて無効化する */
export const booksQueryKey = ["books"];

export const booksQuery = () =>
  queryOptions({ queryKey: booksQueryKey, queryFn: () => listBooks() });
