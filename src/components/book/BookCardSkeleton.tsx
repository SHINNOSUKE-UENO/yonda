import { Card, HStack, Skeleton, SkeletonText } from "@chakra-ui/react";

/** 初回読み込み中に表示する本カードの代わり */
export function BookCardSkeleton() {
  return (
    <Card.Root variant="outline">
      <Card.Body p="3">
        <HStack align="start" gap="3">
          <Skeleton w="16" h="24" flexShrink="0" rounded="sm" />
          <SkeletonText flex="1" noOfLines={3} gap="2" />
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
