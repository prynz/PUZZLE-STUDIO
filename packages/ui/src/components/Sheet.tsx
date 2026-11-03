import type { ReactNode } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import type { MascotEmotion } from '../mascot/pino.ts';
import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';
import { Mascot } from './Mascot.tsx';
import { Text } from './Text.tsx';

export interface SheetProps {
  visible: boolean;
  title: string;
  onRequestClose: () => void;
  /** Pino above the title (omit for none). */
  emotion?: MascotEmotion;
  /** Custom header instead of the plain Pino (e.g. Pino with sparkles). */
  hero?: ReactNode;
  children: ReactNode;
  testID?: string;
}

/** Calm, rounded modal sheet with optional Pino – base for dialogs (confirm, edit, celebration). */
export function Sheet({ visible, title, onRequestClose, emotion, hero, children, testID }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, shadowStyle(shadow.raised)]} accessibilityViewIsModal testID={testID}>
          {hero ?? (emotion ? <Mascot emotion={emotion} size={96} accessibilityLabel={null} /> : null)}
          <Text variant="title2" align="center" accessibilityRole="header">
            {title}
          </Text>
          {children}
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
});
