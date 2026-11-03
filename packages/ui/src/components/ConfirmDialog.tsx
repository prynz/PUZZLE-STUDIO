import { StyleSheet, View } from 'react-native';

import type { MascotEmotion } from '../mascot/pino.ts';
import { spacing } from '../tokens.ts';
import { PrimaryButton } from './PrimaryButton.tsx';
import { SecondaryButton } from './SecondaryButton.tsx';
import { Sheet } from './Sheet.tsx';
import { Text } from './Text.tsx';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  emotion?: MascotEmotion;
}

/** Calm, rounded confirmation dialog with Pino. Primary = confirm, secondary = cancel. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  emotion = 'thinking',
}: ConfirmDialogProps) {
  return (
    <Sheet visible={visible} title={title} onRequestClose={onCancel} emotion={emotion}>
      <Text variant="body" align="center">
        {message}
      </Text>
      <View style={styles.actions}>
        <PrimaryButton
          testID="confirm-yes"
          variant="primary"
          label={confirmLabel}
          onPress={onConfirm}
          showChevron={false}
        />
        <SecondaryButton testID="confirm-no" label={cancelLabel} onPress={onCancel} />
      </View>
    </Sheet>
  );
}

export const dialogStyles = StyleSheet.create({
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.md },
});
const styles = dialogStyles;
