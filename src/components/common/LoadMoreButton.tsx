import { Button, Stack, Text } from "@chakra-ui/react";

export type LoadMoreStatus = "idle" | "loading" | "error" | "done";

type Props = {
  status: LoadMoreStatus;
  /** idle 時は「さらに表示する」、error 時は「再試行」として呼ばれる */
  onClick: () => void;
};

/** C11 「さらに表示する」(本棚・検索で共通) */
export function LoadMoreButton({ status, onClick }: Props) {
  if (status === "done") {
    return (
      <Text py="2" textAlign="center" fontSize="xs" color="fg.muted">
        これ以上ありません
      </Text>
    );
  }

  return (
    <Stack gap="2">
      {status === "error" && (
        <Text textAlign="center" fontSize="sm" color="danger.fg">
          読み込みに失敗しました
        </Text>
      )}
      <Button
        w="full"
        h="11"
        variant="outline"
        colorPalette="gray"
        loading={status === "loading"}
        loadingText="読み込み中..."
        spinnerPlacement="start"
        onClick={onClick}
      >
        {status === "error" ? "再試行" : "さらに表示する"}
      </Button>
    </Stack>
  );
}
