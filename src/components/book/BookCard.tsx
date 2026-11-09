import { Box, Button, Card, Center, HStack, Image, Stack, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { LuBook, LuCheck } from "react-icons/lu";

type Props = {
  title: string;
  authors: string;
  thumbnailUrl: string | null;
  /** 'YYYY-MM-DD'。本棚で表示する */
  readDate?: string;
  /** 指定するとカード全体が詳細画面へのリンクになる(本棚) */
  bookId?: string;
  /** 指定すると右下に登録ボタン / 登録済みを表示する(検索結果)。bookId とは併用しない */
  register?: { registered: boolean; loading: boolean; onClick: () => void };
};

/** C4 本カード */
export function BookCard({ title, authors, thumbnailUrl, readDate, bookId, register }: Props) {
  const body = (
    <Card.Body p="3">
      <HStack align="stretch" gap="3">
        <Cover thumbnailUrl={thumbnailUrl} />
        <Stack flex="1" minW="0" gap="1">
          <Text fontSize="md" fontWeight="semibold" lineClamp={2}>
            {title}
          </Text>
          <Text fontSize="sm" color="fg.muted" truncate>
            {authors}
          </Text>
          {readDate && (
            <Text fontSize="sm" color="fg.muted">
              読了日: {readDate.replaceAll("-", "/")}
            </Text>
          )}
          {register && (
            <Box mt="auto" alignSelf="flex-end">
              {register.registered ? (
                <HStack gap="1" fontSize="sm" color="fg.muted" minH="11">
                  <LuCheck />
                  登録済み
                </HStack>
              ) : (
                <Button
                  variant="outline"
                  colorPalette="gray"
                  minH="11"
                  loading={register.loading}
                  onClick={register.onClick}
                >
                  登録
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </HStack>
    </Card.Body>
  );

  if (!bookId) return <Card.Root variant="outline">{body}</Card.Root>;

  return (
    <Card.Root variant="outline" asChild _active={{ bg: "bg.subtle" }}>
      <Link to="/books/$id" params={{ id: bookId }}>
        {body}
      </Link>
    </Card.Root>
  );
}

/** 表紙(64 × 96)。ない場合は本アイコンのプレースホルダー */
function Cover({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  if (!thumbnailUrl) {
    return (
      <Center
        w="16"
        h="24"
        flexShrink="0"
        rounded="sm"
        bg="bg.subtle"
        borderWidth="1px"
        color="fg.muted"
      >
        <LuBook size={20} />
      </Center>
    );
  }
  // 隣にタイトルがあるため装飾扱い(alt="")
  return (
    <Image
      src={thumbnailUrl}
      alt=""
      w="16"
      h="24"
      flexShrink="0"
      rounded="sm"
      objectFit="cover"
      loading="lazy"
    />
  );
}
