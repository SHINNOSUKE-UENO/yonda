import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import type { LoadMoreStatus } from "#/components/common/LoadMoreButton";
import type { Book } from "#/shared/book";
import { type SortOption, sortOptions } from "./sortOptions";

const PAGE_SIZE = 10;
/** 「さらに表示する」を押してから表示するまでの待ち時間(ms) */
const LOAD_MORE_DELAY = 400;

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

// 読み仮名がないため、漢字の著者名は五十音順にならない(制約として受容)
const collator = new Intl.Collator("ja");

const columnHelper = createColumnHelper<typeof features, Book>();
const columns = columnHelper.columns([
  // 'YYYY-MM-DD' と ISO 8601 は文字列の大小がそのまま日付の前後になる
  columnHelper.accessor("readDate", { sortFn: sortFn_basic }),
  columnHelper.accessor("createdAt", { sortFn: sortFn_basic }),
  columnHelper.accessor("authors", {
    sortFn: (a, b, id) => collator.compare(a.getValue<string>(id), b.getValue<string>(id)),
  }),
]);

/** 本棚の一覧(全件を並び替え、先頭から 10 件ずつ表示する) */
export function useShelfTable(data: Book[]) {
  const [sort, setSortState] = useState<SortOption>(sortOptions[0].value);
  const sorting = sortOptions.find((option) => option.value === sort)!.sorting;
  // 1 ページ目の大きさを増やすことで「先頭から N 件」を表す
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting: [...sorting], pagination: { pageIndex: 0, pageSize } },
  });

  const loadMore = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      setPageSize((size) => size + PAGE_SIZE);
      setLoading(false);
    }, LOAD_MORE_DELAY);
  };

  const setSort = (value: SortOption) => {
    // 読み込み中に並び替えた場合、待ち時間後に件数が増えないよう取り消す
    clearTimeout(timer.current);
    setLoading(false);
    setSortState(value);
    setPageSize(PAGE_SIZE);
  };

  const loadMoreStatus: LoadMoreStatus = loading
    ? "loading"
    : table.getCanNextPage()
      ? "idle"
      : "done";

  return {
    books: table.getRowModel().rows.map((row) => row.original),
    total: data.length,
    sort,
    setSort,
    loadMoreStatus,
    loadMore,
  };
}
