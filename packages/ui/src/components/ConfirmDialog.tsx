import { Modal, StyleSheet, View } from 'react-native';

import type { MascotEmotion } from '../mascot/pino.ts';
import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';
import { Mascot } from './Mascot.tsx';
import { PrimaryButton } from './PrimaryButton.tsx';
import { SecondaryButton } from './SecondaryButton.tsx';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, shadowStyle(shadow.raised)]} accessibilityViewIsModal>
          <Mascot emotion={emotion} size={96} accessibilityLabel={null} />
          <Text variant="title2" align="center" accessibilityRole="header">
            {title}
          </Text>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: color.scrim, justifyContent: 'center', padding: spacing.xl },
  sheet: {
    backgroundColor: color.background.primary,
    borderRadius: radius.sheet,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.md },
});
