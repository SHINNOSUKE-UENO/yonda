import type { SortingState } from "@tanstack/react-table";

/** 本棚の並び替えの選択肢。先頭が初期値 */
export const sortOptions = [
  { value: "readDate-desc", label: "読了日が新しい順", sorting: [{ id: "readDate", desc: true }] },
  { value: "readDate-asc", label: "読了日が古い順", sorting: [{ id: "readDate", desc: false }] },
  { value: "authors-asc", label: "著者順", sorting: [{ id: "authors", desc: false }] },
  {
    value: "createdAt-desc",
    label: "登録日が新しい順",
    sorting: [{ id: "createdAt", desc: true }],
  },
  { value: "createdAt-asc", label: "登録日が古い順", sorting: [{ id: "createdAt", desc: false }] },
] as const satisfies ReadonlyArray<{ value: string; label: string; sorting: SortingState }>;

export type SortOption = (typeof sortOptions)[number]["value"];
