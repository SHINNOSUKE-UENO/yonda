import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { books } from "./db/schema";

/** 登録済みの本(books テーブルの 1 行) */
export type Book = typeof books.$inferSelect;

/** 検索結果から登録するときの入力 */
export const registerBookInput = createInsertSchema(books, {
  googleBooksId: (schema) => schema.min(1),
  title: (schema) => schema.min(1),
  thumbnailUrl: z.url().nullable(),
}).pick({ googleBooksId: true, title: true, authors: true, thumbnailUrl: true });
export type RegisterBookInput = z.infer<typeof registerBookInput>;

/** 検索結果の 1 冊(登録時はこの値をそのまま送る)。authors は省略せず必ず入れる */
export type SearchBook = Required<RegisterBookInput>;
export type SearchResult = SearchBook & { registered: boolean };

/** 検索の入力。startIndex は 0 始まり */
export const searchBooksInput = z.object({
  query: z.string().trim().min(1),
  startIndex: z.int().min(0),
});

/** 詳細画面で保存するときの入力 */
export const updateBookInput = createSelectSchema(books, {
  id: z.uuid(),
  readDate: z.iso.date({ error: "読了日を入力してください" }),
}).pick({ id: true, readDate: true, memo: true });
export type UpdateBookInput = z.infer<typeof updateBookInput>;

/** 1 件取得・削除の入力 */
export const bookIdInput = createSelectSchema(books, { id: z.uuid() }).pick({ id: true });
