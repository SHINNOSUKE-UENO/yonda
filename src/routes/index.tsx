import { Button, HStack, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LuBookOpen } from "react-icons/lu";
import { BookCard } from "#/components/book/BookCard";
import { BookCardSkeleton } from "#/components/book/BookCardSkeleton";
import { EmptyState } from "#/components/common/EmptyState";
import { LoadMoreButton } from "#/components/common/LoadMoreButton";
import { PageLayout } from "#/components/layout/PageLayout";
import { booksQuery } from "#/features/books/queries";
import { type SortOption, sortOptions } from "#/features/shelf/sortOptions";
import { useShelfTable } from "#/features/shelf/useShelfTable";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(booksQuery()),
  component: ShelfPage,
  pendingComponent: ShelfPending,
});

function ShelfPage() {
  const { data } = useSuspenseQuery(booksQuery());
  const { books, total, sort, setSort, loadMoreStatus, loadMore } = useShelfTable(data);

  if (total === 0) {
    return (
      <PageLayout title="本棚" activeTab="shelf">
        <EmptyState
          icon={<LuBookOpen size={28} />}
          title="まだ本がありません"
          description="検索から本を追加しましょう"
        >
          <Button asChild minH="11">
            <Link to="/search">本を検索する</Link>
          </Button>
        </EmptyState>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="本棚" activeTab="shelf">
      <HStack gap="3" mb="4">
        <NativeSelect.Root flex="1">
          <NativeSelect.Field
            aria-label="並び替え"
            value={sort}
            onChange={(e) => setSort(e.currentTarget.value as SortOption)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Text fontSize="xs" color="fg.muted" flexShrink="0">
          全 {total} 冊
        </Text>
      </HStack>
      <Stack gap="3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            bookId={book.id}
            title={book.title}
            authors={book.authors}
            thumbnailUrl={book.thumbnailUrl}
            readDate={book.readDate}
          />
        ))}
        {/* 10 件以下のときはボタンも「これ以上ありません」も出さない */}
        {total > 10 && <LoadMoreButton status={loadMoreStatus} onClick={loadMore} />}
      </Stack>
    </PageLayout>
  );
}

/** 初回読み込み中(スケルトンカード 3 枚) */
function ShelfPending() {
  return (
    <PageLayout title="本棚" activeTab="shelf">
      <Stack gap="3">
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
      </Stack>
    </PageLayout>
  );
}
