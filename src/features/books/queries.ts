import { queryOptions } from "@tanstack/react-query";
import { isNotFound } from "@tanstack/react-router";
import { getBook, listBooks } from "#/server/functions/books";

/** 登録済みの本のキャッシュは "books" から始まるキーにそろえ、更新時はまとめて無効化する */
export const booksQueryKey = ["books"];

export const booksQuery = () =>
  queryOptions({ queryKey: booksQueryKey, queryFn: () => listBooks() });

export const bookQuery = (id: string) =>
  queryOptions({
    queryKey: [...booksQueryKey, id],
    queryFn: () => getBook({ data: { id } }),
    // 見つからない本はやり直しても見つからない(初期設定の 3 回のやり直しで表示が数秒遅れる)
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
  });
