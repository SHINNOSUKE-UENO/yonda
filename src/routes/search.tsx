import { Box, Button, HStack, Input, Stack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { LuCircleAlert, LuSearch } from "react-icons/lu";
import { BookCard } from "#/components/book/BookCard";
import { BookCardSkeleton } from "#/components/book/BookCardSkeleton";
import { EmptyState } from "#/components/common/EmptyState";
import { Header } from "#/components/layout/Header";
import { TabBar } from "#/components/layout/TabBar";
import { useBookSearch } from "#/features/search/useBookSearch";

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  // 検索ボタン(またはキーボードの検索キー)を押した時点の値で検索する
  const [query, setQuery] = useState("");
  const { status, results, retry } = useBookSearch(query);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(String(new FormData(e.currentTarget).get("q")).trim());
  };

  return (
    <>
      <Header title="検索" />
      <Box
        as="main"
        display="flex"
        flexDirection="column"
        minH="calc(100dvh - 3.5rem)"
        px="4"
        pt="4"
        pb="calc(4.5rem + env(safe-area-inset-bottom))"
      >
        <HStack asChild gap="2" mb="4">
          <form role="search" onSubmit={onSubmit}>
            <Input
              name="q"
              type="search"
              enterKeyHint="search"
              aria-label="検索キーワード"
              placeholder="タイトル・著者名で検索"
              variant="subtle"
              h="11"
              flex="1"
            />
            <Button type="submit" h="11">
              検索
            </Button>
          </form>
        </HStack>

        {status === "initial" && (
          <EmptyState
            icon={<LuSearch size={24} />}
            description="タイトルや著者名を入力して、読んだ本を探しましょう"
          />
        )}

        {status === "pending" && (
          <Stack gap="3">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </Stack>
        )}

        {status === "error" && (
          <EmptyState
            icon={<LuCircleAlert size={24} />}
            title="通信エラーが発生しました"
            description="通信状況を確認して、もう一度お試しください"
          >
            <Button variant="outline" colorPalette="gray" h="11" onClick={retry}>
              再試行
            </Button>
          </EmptyState>
        )}

        {status === "success" && results.length === 0 && (
          <EmptyState
            icon={<LuSearch size={24} />}
            title="本が見つかりませんでした"
            description="キーワードを変えて検索してください"
          />
        )}

        {status === "success" && results.length > 0 && (
          <Stack gap="3">
            {results.map((book) => (
              <BookCard
                key={book.googleBooksId}
                title={book.title}
                authors={book.authors}
                thumbnailUrl={book.thumbnailUrl}
              />
            ))}
          </Stack>
        )}
      </Box>
      <TabBar active="search" />
    </>
  );
}
