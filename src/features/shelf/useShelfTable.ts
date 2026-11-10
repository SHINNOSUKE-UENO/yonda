import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Book } from "#/shared/book";
import { type SortOption, sortOptions } from "./sortOptions";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
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

/** 本棚の一覧(全件を並び替える) */
export function useShelfTable(data: Book[]) {
  const [sort, setSort] = useState<SortOption>(sortOptions[0].value);
  const sorting = sortOptions.find((option) => option.value === sort)!.sorting;

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting: [...sorting] },
  });

  return {
    books: table.getRowModel().rows.map((row) => row.original),
    total: data.length,
    sort,
    setSort,
  };
}
