import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressBounce } from '../motion/usePressBounce.ts';

import { shadowStyle } from '../styles/helpers.ts';
import { color, palette, radius, shadow, spacing, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface SortBasketProps {
  label: string;
  count: number;
  /** Group colour (colour baskets). Shown as a dot next to the name (colour + text, colour-blind safe). */
  swatch?: string;
  selected: boolean;
  onPress: () => void;
  /** Rename / reorder (profiles kid & pro). */
  onLongPress?: () => void;
  /** Spoken label, e.g. "Schale Himmel, 12 Teile". */
  accessibilityLabel: string;
  testID?: string;
}

/** Sorting basket ("Schale") above the tray: name, colour dot and number of pieces. */
export function SortBasket({
  label,
  count,
  swatch,
  selected,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}: SortBasketProps) {
  const bounce = usePressBounce();
  return (
    <Animated.View style={bounce.style}>
      <Pressable
        {...bounce.handlers}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        style={[styles.basket, selected ? styles.on : null, shadowStyle(shadow.card)]}
      >
        {swatch ? <View style={[styles.dot, { backgroundColor: swatch }]} /> : null}
        <Text variant="label" numberOfLines={1}>
          {label}
        </Text>
        <View style={[styles.count, selected ? styles.countOn : null]}>
          <Text variant="caption" style={styles.countText}>
            {count}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  basket: {
    minHeight: touch.child,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: color.background.raised,
    borderWidth: 2,
    borderColor: color.border.card,
  },
  on: { backgroundColor: palette.lavender100, borderColor: palette.lavender },
  dot: { width: 18, height: 18, borderRadius: radius.pill, borderWidth: 2, borderColor: palette.white },
  count: {
    minWidth: 28,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.cream200,
    alignItems: 'center',
  },
  countOn: { backgroundColor: palette.white },
  countText: { color: color.text.primary },
});
