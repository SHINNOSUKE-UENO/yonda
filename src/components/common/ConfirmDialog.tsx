import { Button, Dialog, Portal, Text } from "@chakra-ui/react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** 実行中はボタンを読み込み中にし、閉じられないようにする */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** C8 確認ダイアログ(背景を暗転し、画面中央に表示) */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog.Root
      role="alertdialog"
      placement="center"
      open={open}
      onOpenChange={(e) => {
        if (!e.open && !loading) onCancel();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px="4">
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="md" fontWeight="bold">
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="sm" color="fg.muted">
                {description}
              </Text>
            </Dialog.Body>
            <Dialog.Footer gap="3">
              <Dialog.ActionTrigger asChild>
                <Button flex="1" h="11" variant="outline" colorPalette="gray" disabled={loading}>
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                flex="1"
                h="11"
                variant="outline"
                colorPalette="danger"
                loading={loading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
