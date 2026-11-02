import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MascotEmotion } from '../mascot/pino.ts';
import { spacing } from '../tokens.ts';
import { Mascot } from './Mascot.tsx';
import { Text } from './Text.tsx';

export interface EmptyStateProps {
  emotion?: MascotEmotion;
  title: string;
  message: string;
  action?: ReactNode;
  testID?: string;
}

/** Friendly empty / not-yet-available state with Pino. */
export function EmptyState({ emotion = 'thinking', title, message, action, testID }: EmptyStateProps) {
  return (
    <View style={styles.wrap} testID={testID}>
      <Mascot emotion={emotion} size={170} animated />
      <Text variant="title2" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="bodyLarge" align="center" style={styles.message}>
        {message}
      </Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  message: { maxWidth: 300 },
  action: { marginTop: spacing.md, alignSelf: 'stretch' },
});
