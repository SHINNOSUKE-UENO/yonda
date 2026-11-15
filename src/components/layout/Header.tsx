import { ClientOnly, Flex, Heading, IconButton, Skeleton } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { LuChevronLeft, LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "#/components/ui/color-mode";

type Props = {
  title: string;
  /** 詳細画面のみ true。本棚へ戻る */
  showBack?: boolean;
};

/** C1 ヘッダー */
export function Header({ title, showBack = false }: Props) {
  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      h="14"
      px="4"
      align="center"
      gap="1"
      bg="bg"
      borderBottomWidth="1px"
    >
      {showBack && (
        <IconButton
          asChild
          aria-label="本棚へ戻る"
          variant="ghost"
          colorPalette="gray"
          size="lg"
          ms="-3"
        >
          <Link to="/">
            <LuChevronLeft />
          </Link>
        </IconButton>
      )}
      <Heading as="h1" flex="1" fontSize="xl" fontWeight="bold">
        {title}
      </Heading>
      <ColorModeToggle />
    </Flex>
  );
}

/** ライト時は月(ダークへ)、ダーク時は太陽(ライトへ)を表示する */
function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    // テーマはブラウザ側でしか確定しないため、SSR ではプレースホルダーを出す
    <ClientOnly fallback={<Skeleton boxSize="11" />}>
      <IconButton
        aria-label={isDark ? "ライトモードにする" : "ダークモードにする"}
        variant="ghost"
        colorPalette="gray"
        size="lg"
        me="-3"
        onClick={toggleColorMode}
      >
        {isDark ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  );
}
