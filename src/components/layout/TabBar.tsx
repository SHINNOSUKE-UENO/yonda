import { Flex } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { LuBook, LuSearch } from "react-icons/lu";

const tabs = [
  { key: "shelf", to: "/", label: "本棚", Icon: LuBook },
  { key: "search", to: "/search", label: "検索", Icon: LuSearch },
] as const;

type Props = {
  /** 詳細画面では "shelf" を渡す */
  active: (typeof tabs)[number]["key"];
};

/** C2 下部タブバー */
export function TabBar({ active }: Props) {
  return (
    <Flex
      as="nav"
      position="fixed"
      bottom="0"
      insetX="0"
      zIndex="sticky"
      minH="14"
      pb="env(safe-area-inset-bottom)"
      bg="bg"
      borderTopWidth="1px"
    >
      {tabs.map(({ key, to, label, Icon }) => (
        <Flex
          key={key}
          asChild
          flex="1"
          direction="column"
          align="center"
          justify="center"
          gap="0.5"
          fontSize="xs"
          color="fg.muted"
          aria-current={active === key ? "page" : undefined}
          _currentPage={{ color: "accent.fg", fontWeight: "semibold" }}
        >
          <Link to={to}>
            <Icon size={22} />
            {label}
          </Link>
        </Flex>
      ))}
    </Flex>
  );
}
