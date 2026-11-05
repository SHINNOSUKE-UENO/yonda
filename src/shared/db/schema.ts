import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(), // crypto.randomUUID()
  googleBooksId: text("google_books_id").notNull().unique(), // 二重登録防止・「登録済み」判定
  title: text("title").notNull(),
  authors: text("authors").notNull().default(""), // 「、」区切りの表示用文字列
  thumbnailUrl: text("thumbnail_url"), // https に置換して保存
  readDate: text("read_date").notNull(), // 'YYYY-MM-DD'(初期値=登録日 JST)
  memo: text("memo").notNull().default(""),
  createdAt: text("created_at").notNull(), // ISO 8601
  updatedAt: text("updated_at").notNull(),
});
