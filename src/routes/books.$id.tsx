import {
  Button,
  Center,
  Field,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { LuBook, LuSearchX } from "react-icons/lu";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageLayout } from "#/components/layout/PageLayout";
import { useBookForm } from "#/features/book-detail/useBookForm";
import { useDeleteBook } from "#/features/book-detail/useDeleteBook";
import { bookQuery } from "#/features/books/queries";
import { bookIdInput } from "#/shared/book";

export const Route = createFileRoute("/books/$id")({
  loader: ({ context, params }) => {
    // 形式が違う ID はサーバー関数の入力検証でエラーになるため、先に「見つからない」とする
    if (!bookIdInput.safeParse(params).success) throw notFound();
    return context.queryClient.ensureQueryData(bookQuery(params.id));
  },
  component: BookDetailPage,
  notFoundComponent: BookNotFound,
});

function BookDetailPage() {
  const { id } = Route.useParams();
  const { data: book } = useSuspenseQuery(bookQuery(id));
  const form = useBookForm(book);
  const { remove, removing } = useDeleteBook(book.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.save();
  };

  return (
    <PageLayout title="本の詳細" showBack activeTab="shelf">
      <Stack gap="4">
        <Center>
          <Cover thumbnailUrl={book.thumbnailUrl} />
        </Center>
        <Stack gap="1">
          <Heading as="h2" fontSize="xl" fontWeight="bold">
            {book.title}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {book.authors}
          </Text>
        </Stack>

        {/* 送信時のエラー表示を自前で行うため、ブラウザ標準の検証(required)は使わない */}
        <Stack asChild gap="5" mt="2">
          <form noValidate onSubmit={onSubmit}>
            <Field.Root invalid={!!form.readDateError}>
              <Field.Label fontWeight="bold">
                読了日
                <Text as="span" color="fg.muted" fontWeight="normal">
                  (必須)
                </Text>
              </Field.Label>
              <Input
                type="date"
                variant="subtle"
                h="11"
                aria-required
                value={form.readDate}
                onChange={(e) => form.setReadDate(e.currentTarget.value)}
              />
              <Field.ErrorText>{form.readDateError}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label fontWeight="bold">感想メモ</Field.Label>
              <Textarea
                variant="subtle"
                minH="160px"
                value={form.memo}
                onChange={(e) => form.setMemo(e.currentTarget.value)}
              />
            </Field.Root>

            <Button type="submit" w="full" h="11" disabled={!form.canSave} loading={form.saving}>
              保存
            </Button>
          </form>
        </Stack>
        <Button
          variant="outline"
          colorPalette="danger"
          w="full"
          h="11"
          onClick={() => setConfirmOpen(true)}
        >
          削除
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          title="この本を削除しますか?"
          description="感想メモも削除されます。元に戻せません。"
          confirmLabel="削除する"
          loading={removing}
          onConfirm={remove}
          onCancel={() => setConfirmOpen(false)}
        />
      </Stack>
    </PageLayout>
  );
}

/** 削除済み・存在しない ID のとき */
function BookNotFound() {
  return (
    <PageLayout title="本の詳細" showBack activeTab="shelf">
      <EmptyState
        icon={<LuSearchX size={24} />}
        title="本が見つかりませんでした"
        description="削除されたか、URL が間違っている可能性があります"
      >
        <Button asChild variant="outline" colorPalette="gray" minH="11">
          <Link to="/">本棚へ戻る</Link>
        </Button>
      </EmptyState>
    </PageLayout>
  );
}

/** 表紙(120 × 180)。ない場合は本アイコンのプレースホルダー */
function Cover({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  if (!thumbnailUrl) {
    return (
      <Center w="120px" h="180px" rounded="sm" bg="bg.subtle" borderWidth="1px" color="fg.muted">
        <LuBook size={32} />
      </Center>
    );
  }
  // 直後にタイトルがあるため装飾扱い(alt="")
  return <Image src={thumbnailUrl} alt="" w="120px" h="180px" rounded="sm" objectFit="cover" />;
}
