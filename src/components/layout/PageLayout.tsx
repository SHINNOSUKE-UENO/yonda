import { Box } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";
import { Header } from "./Header";
import { TabBar } from "./TabBar";

type Props = {
  title: string;
  /** 詳細画面のみ true。本棚へ戻る */
  showBack?: boolean;
  activeTab: ComponentProps<typeof TabBar>["active"];
  children: ReactNode;
};

/** 画面の共通枠(ヘッダー・本文・タブバー) */
export function PageLayout({ title, showBack, activeTab, children }: Props) {
  return (
    <>
      <Header title={title} showBack={showBack} />
      {/* 固定タブバー(56px + セーフエリア)に末尾が隠れないよう下に余白を取る */}
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
      <TabBar active={activeTab} />
    </>
  );
}
