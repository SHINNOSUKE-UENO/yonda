import { Box, Button, HStack, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LuBookOpen } from "react-icons/lu";
import { BookCard } from "#/components/book/BookCard";
import { BookCardSkeleton } from "#/components/book/BookCardSkeleton";
import { EmptyState } from "#/components/common/EmptyState";
import { Header } from "#/components/layout/Header";
import { TabBar } from "#/components/layout/TabBar";
import { type SortOption, sortOptions } from "#/features/shelf/sortOptions";
import { useShelfTable } from "#/features/shelf/useShelfTable";
import { listBooks } from "#/server/functions/books";

export const Route = createFileRoute("/")({
  loader: () => listBooks(),
  component: ShelfPage,
  pendingComponent: ShelfPending,
});

function ShelfPage() {
  const { books, total, sort, setSort } = useShelfTable(Route.useLoaderData());

  if (total === 0) {
    return (
      <ShelfLayout>
        <EmptyState
          icon={<LuBookOpen size={28} />}
          title="まだ本がありません"
          description="検索から本を追加しましょう"
        >
          <Button asChild minH="11">
            <Link to="/search">本を検索する</Link>
          </Button>
        </EmptyState>
      </ShelfLayout>
    );
  }

  return (
    <ShelfLayout>
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
      </Stack>
    </ShelfLayout>
  );
}

/** 初回読み込み中(スケルトンカード 3 枚) */
function ShelfPending() {
  return (
    <ShelfLayout>
      <Stack gap="3">
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
      </Stack>
    </ShelfLayout>
  );
}

function ShelfLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header title="本棚" />
      <Box
        as="main"
        display="flex"
        flexDirection="column"
        minH="calc(100dvh - 3.5rem)"
        px="4"
        pt="4"
        pb="calc(4.5rem + env(safe-area-inset-bottom))"
      >
        {children}
      </Box>
      <TabBar active="shelf" />
    </>
  );
}
