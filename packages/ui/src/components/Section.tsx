import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface SectionProps {
  title?: string;
  /** Small element right of the title (count, link button). */
  aside?: ReactNode;
  children: ReactNode;
  /** Soft tinted background to tell sections apart. */
  tone?: keyof typeof color.surface | 'raised';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A clearly separated block of a screen: own rounded card, title row and breathing room.
 * Screens stack sections with `layout.sectionGap` between them.
 */
export function Section({ title, aside, children, tone = 'raised', style, testID }: SectionProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        { backgroundColor: tone === 'raised' ? color.background.raised : color.surface[tone] },
        shadowStyle(shadow.card),
        style,
      ]}
    >
      {title || aside ? (
        <View style={styles.head}>
          {title ? (
            <Text variant="title3" accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          ) : null}
          {aside}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: color.border.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  title: { flex: 1 },
});
