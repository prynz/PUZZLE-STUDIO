import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';

/** White speech bubble with a small tail on the left (Pino talking). */
export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.tail} />
      <View style={[styles.bubble, shadowStyle(shadow.card)]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  bubble: {
    backgroundColor: color.background.raised,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tail: {
    position: 'absolute',
    left: -6,
    width: 18,
    height: 18,
    backgroundColor: color.background.raised,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
});
