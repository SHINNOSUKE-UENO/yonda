import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toaster } from "#/components/ui/toaster";
import { booksQueryKey } from "#/features/books/queries";
import { deleteBook } from "#/server/functions/books";
import type { Book } from "#/shared/book";

/** 本の削除。完了後は本棚へ移動する */
export function useDeleteBook(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => deleteBook({ data: { id } }),
    onSuccess: async () => {
      // 本棚に戻った瞬間に削除済みの本が見えないよう、一覧から先に取り除く
      queryClient.setQueryData<Book[]>(booksQueryKey, (books) =>
        books?.filter((book) => book.id !== id),
      );
      await navigate({ to: "/" });
      // 詳細を表示中に消すと取り直しが走るため、移動してから消す
      queryClient.removeQueries({ queryKey: [...booksQueryKey, id] });
      toaster.create({ type: "success", title: "削除しました" });
    },
    onError: () => toaster.create({ type: "error", title: "削除に失敗しました" }),
  });

  return { remove: () => mutation.mutate(), removing: mutation.isPending };
}
