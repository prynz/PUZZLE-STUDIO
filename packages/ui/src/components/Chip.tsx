import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressBounce } from '../motion/usePressBounce.ts';

import { color, palette, radius, spacing, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/** Small toggle pill (filters, formats). Min. 48 dp high. */
export function Chip({ label, selected, onPress, testID }: ChipProps) {
  const bounce = usePressBounce();
  return (
    <Animated.View style={bounce.style}>
      <Pressable
        {...bounce.handlers}
        testID={testID}
        accessibilityRole="radio"
        accessibilityState={{ selected, checked: selected }}
        accessibilityLabel={label}
        onPress={onPress}
        style={[styles.chip, selected ? styles.on : null]}
      >
        <Text variant="label" style={{ color: selected ? color.brand.strong : color.text.primary }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    // visible on white sections too: soft cream with a lavender rim
    backgroundColor: palette.mist,
    borderWidth: 2,
    borderColor: palette.leaf200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: palette.leaf100, borderColor: palette.leaf },
});
