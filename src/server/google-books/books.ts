import type { SearchBook } from "#/shared/book";

const PAGE_SIZE = 10;

/** Google Books API の volume のうち使う項目だけ */
type Volume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string };
  };
};

/** 書籍を検索する(startIndex から 10 件)。0 件のときは空配列 */
export async function searchBooks(
  query: string,
  startIndex: number,
  apiKey: string,
): Promise<SearchBook[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("startIndex", String(startIndex));
  url.searchParams.set("maxResults", String(PAGE_SIZE));
  // キーなしだと全利用者の共有枠になり、すぐ 429 になる
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);

  // 0 件のときは items 自体がない
  const body: { items?: Volume[] } = await res.json();
  return (body.items ?? []).map(toSearchBook);
}

export function toSearchBook({ id, volumeInfo }: Volume): SearchBook {
  return {
    googleBooksId: id,
    title: volumeInfo.title,
    authors: (volumeInfo.authors ?? []).join("、"),
    // http のままだと https のページで混在コンテンツになる
    thumbnailUrl: volumeInfo.imageLinks?.thumbnail?.replace(/^http:/, "https:") ?? null,
  };
}
