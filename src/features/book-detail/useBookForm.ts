import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toaster } from "#/components/ui/toaster";
import { booksQueryKey } from "#/features/books/queries";
import { updateBook } from "#/server/functions/books";
import { type Book, type UpdateBookInput, updateBookInput } from "#/shared/book";

/** 詳細画面の読了日・感想メモの編集と保存 */
export function useBookForm(book: Book) {
  const queryClient = useQueryClient();
  const [readDate, setReadDate] = useState(book.readDate);
  const [memo, setMemo] = useState(book.memo);
  const [readDateError, setReadDateError] = useState<string>();

  const mutation = useMutation({
    mutationFn: (input: UpdateBookInput) => updateBook({ data: input }),
    // 取り直しが終わるまで保存中のままにし、ボタンが一瞬押せる状態に戻るのを防ぐ
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: booksQueryKey });
      toaster.create({ type: "success", title: "保存しました" });
    },
    onError: () => toaster.create({ type: "error", title: "保存に失敗しました" }),
  });

  const save = () => {
    const parsed = updateBookInput.safeParse({ id: book.id, readDate, memo });
    if (!parsed.success) {
      setReadDateError(z.flattenError(parsed.error).fieldErrors.readDate?.[0]);
      return;
    }
    setReadDateError(undefined);
    mutation.mutate(parsed.data);
  };

  return {
    readDate,
    setReadDate,
    memo,
    setMemo,
    readDateError,
    save,
    saving: mutation.isPending,
    // 保存済みの値と比べて、変更があるときだけ保存できる
    canSave: readDate !== book.readDate || memo !== book.memo,
  };
}
