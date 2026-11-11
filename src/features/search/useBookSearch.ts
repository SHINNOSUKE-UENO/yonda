import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { LoadMoreStatus } from "#/components/common/LoadMoreButton";
import { toaster } from "#/components/ui/toaster";
import { booksQueryKey } from "#/features/books/queries";
import { registerBook } from "#/server/functions/books";
import { searchBooks } from "#/server/functions/search";
import type { SearchResult } from "#/shared/book";

const PAGE_SIZE = 10;
/** 「さらに表示する」を押してから表示するまでの最低待ち時間(ms) */
const LOAD_MORE_DELAY = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 書籍検索(10 件ずつ)と登録。query が空のときは取得しない */
export function useBookSearch(query: string) {
  const queryClient = useQueryClient();
  const queryKey = ["search", query];

  const search = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const request = searchBooks({ data: { query, startIndex: pageParam } });
      if (pageParam === 0) return request;
      // 追加分は、API が速く返っても最低限待ってから表示する
      const [page] = await Promise.all([request, sleep(LOAD_MORE_DELAY)]);
      return page;
    },
    initialPageParam: 0,
    // 0 件が返ったら終わり(totalItems は不正確なため使わない)
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + PAGE_SIZE,
    enabled: query !== "",
    // 失敗時は画面の「再試行」に任せる(自動で 3 回やり直すと、エラー表示まで数秒待たされる)
    retry: false,
    // 画面に戻るたびに全ページを取り直すと API の利用回数を消費するため、取り直さない
    staleTime: Infinity,
  });

  const registration = useMutation({
    // 画面に出ている書誌情報をそのまま送る(registered は送らない)
    mutationFn: ({ googleBooksId, title, authors, thumbnailUrl }: SearchResult) =>
      registerBook({ data: { googleBooksId, title, authors, thumbnailUrl } }),
    onSuccess: (_book, { googleBooksId }) => {
      // 全ページを取り直さず、キャッシュ上のその本だけを登録済みにする
      queryClient.setQueryData<InfiniteData<SearchResult[]>>(queryKey, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page.map((b) =>
                  b.googleBooksId === googleBooksId ? { ...b, registered: true } : b,
                ),
              ),
            }
          : data,
      );
      // 本棚の一覧を次に表示するときに取り直す
      void queryClient.invalidateQueries({ queryKey: booksQueryKey });
      toaster.create({ type: "success", title: "登録しました" });
    },
    onError: () => toaster.create({ type: "error", title: "登録に失敗しました" }),
  });

  const loadMoreStatus: LoadMoreStatus = search.isFetchingNextPage
    ? "loading"
    : search.isFetchNextPageError
      ? "error"
      : search.hasNextPage
        ? "idle"
        : "done";

  return {
    // 取得しないときも useInfiniteQuery は "pending" になるため、未検索を区別する
    status: query === "" ? ("initial" as const) : search.status,
    results: search.data?.pages.flat() ?? [],
    // Promise は使わないので返さない(呼び出し側は onClick に渡すだけ)
    retry: () => void search.refetch(),
    loadMoreStatus,
    loadMore: () => void search.fetchNextPage(),
    register: registration.mutate,
    /** 登録処理中の本の ID(ボタンの読み込み表示用) */
    registeringId: registration.isPending ? registration.variables.googleBooksId : undefined,
  };
}
