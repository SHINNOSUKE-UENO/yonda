import { HStack, Text } from "@chakra-ui/react";
import { LuWifiOff } from "react-icons/lu";

/** C3 オフラインバナー(表示するかどうかは呼び出し側で判断する) */
export function OfflineBanner() {
  return (
    <HStack
      role="status"
      position="sticky"
      top="14"
      zIndex="sticky"
      gap="2"
      px="4"
      py="2"
      bg="warning.bg"
      color="warning.fg"
      fontSize="sm"
    >
      <LuWifiOff />
      <Text>オフラインです。検索・登録・編集はできません</Text>
    </HStack>
  );
}
