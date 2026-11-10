import { useInfiniteQuery } from "@tanstack/react-query";
import { searchBooks } from "#/server/functions/search";

const PAGE_SIZE = 10;

/** 書籍検索(10 件ずつ)。query が空のときは取得しない */
export function useBookSearch(query: string) {
  const search = useInfiniteQuery({
    queryKey: ["search", query],
    queryFn: ({ pageParam }) => searchBooks({ data: { query, startIndex: pageParam } }),
    initialPageParam: 0,
    // 0 件が返ったら終わり(totalItems は不正確なため使わない)
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + PAGE_SIZE,
    enabled: query !== "",
    // 失敗時は画面の「再試行」に任せる(自動で 3 回やり直すと、エラー表示まで数秒待たされる)
    retry: false,
  });

  return {
    // 取得しないときも useInfiniteQuery は "pending" になるため、未検索を区別する
    status: query === "" ? ("initial" as const) : search.status,
    results: search.data?.pages.flat() ?? [],
    retry: () => search.refetch(),
  };
}
