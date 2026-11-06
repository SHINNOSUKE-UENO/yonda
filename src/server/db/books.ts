import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Book, RegisterBookInput, UpdateBookInput } from "#/shared/book";
import { todayInTokyo } from "#/shared/date";
import { books } from "#/shared/db/schema";

/** 全件(並び替え・10 件ずつの表示はクライアントで行う) */
export async function listBooks(d1: D1Database): Promise<Book[]> {
  return drizzle(d1).select().from(books);
}

export async function getBook(d1: D1Database, id: string): Promise<Book | undefined> {
  return drizzle(d1).select().from(books).where(eq(books.id, id)).get();
}

/** 読了日の初期値は登録日(日本時間)。同じ google_books_id は UNIQUE 制約で失敗する */
export async function registerBook(
  d1: D1Database,
  input: RegisterBookInput,
  now: Date = new Date(),
): Promise<Book> {
  const timestamp = now.toISOString();
  return drizzle(d1)
    .insert(books)
    .values({
      ...input,
      id: crypto.randomUUID(),
      readDate: todayInTokyo(now),
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();
}

export async function updateBook(
  d1: D1Database,
  { id, ...values }: UpdateBookInput,
  now: Date = new Date(),
): Promise<Book | undefined> {
  return drizzle(d1)
    .update(books)
    .set({ ...values, updatedAt: now.toISOString() })
    .where(eq(books.id, id))
    .returning()
    .get();
}

export async function deleteBook(d1: D1Database, id: string): Promise<void> {
  await drizzle(d1).delete(books).where(eq(books.id, id));
}

/** 検索結果の ID のうち登録済みのものを返す(「登録済み」表示に使う) */
export async function findRegisteredGoogleBooksIds(
  d1: D1Database,
  googleBooksIds: string[],
): Promise<string[]> {
  const rows = await drizzle(d1)
    .select({ googleBooksId: books.googleBooksId })
    .from(books)
    .where(inArray(books.googleBooksId, googleBooksIds));
  return rows.map((row) => row.googleBooksId);
}
