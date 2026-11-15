import { Circle, EmptyState as ChakraEmptyState, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title?: string;
  description: string;
  /** 行動ボタン(例: 本を検索する) */
  children?: ReactNode;
};

/** C10 空状態(アイコン・見出し・説明・行動ボタンを縦中央に並べる) */
export function EmptyState({ icon, title, description, children }: Props) {
  return (
    <ChakraEmptyState.Root flex="1" display="flex" alignItems="center" justifyContent="center">
      <ChakraEmptyState.Content gap="4">
        <ChakraEmptyState.Indicator>
          <Circle size="16" bg="bg.subtle" color="fg.muted">
            {icon}
          </Circle>
        </ChakraEmptyState.Indicator>
        <VStack gap="2" textAlign="center">
          {title && (
            <ChakraEmptyState.Title fontSize="md" fontWeight="bold">
              {title}
            </ChakraEmptyState.Title>
          )}
          <ChakraEmptyState.Description fontSize="sm" color="fg.muted">
            {description}
          </ChakraEmptyState.Description>
        </VStack>
        {children}
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}
