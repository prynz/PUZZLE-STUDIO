import { Pressable, StyleSheet } from 'react-native';

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
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected ? styles.on : null]}
    >
      <Text variant="label" style={{ color: selected ? color.brand.purpleStrong : color.text.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touch.min,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: color.background.raised,
    borderWidth: 2,
    borderColor: color.border.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: palette.lavender100, borderColor: palette.lavender },
});
