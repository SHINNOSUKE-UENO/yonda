import { Box, Button, Center, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LuBook, LuSearchX } from "react-icons/lu";
import { EmptyState } from "#/components/common/EmptyState";
import { Header } from "#/components/layout/Header";
import { TabBar } from "#/components/layout/TabBar";
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

  return (
    <DetailLayout>
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
      </Stack>
    </DetailLayout>
  );
}

/** 削除済み・存在しない ID のとき */
function BookNotFound() {
  return (
    <DetailLayout>
      <EmptyState
        icon={<LuSearchX size={24} />}
        title="本が見つかりませんでした"
        description="削除されたか、URL が間違っている可能性があります"
      >
        <Button asChild variant="outline" colorPalette="gray" minH="11">
          <Link to="/">本棚へ戻る</Link>
        </Button>
      </EmptyState>
    </DetailLayout>
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

function DetailLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header title="本の詳細" showBack />
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
      {/* 詳細は本棚の下の階層なので、本棚タブをアクティブにする */}
      <TabBar active="shelf" />
    </>
  );
}
