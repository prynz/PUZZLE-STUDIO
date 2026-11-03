import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressBounce } from '../motion/usePressBounce.ts';
import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

function Key({ digit, onPress, testIDPrefix }: { digit: number; onPress: (d: number) => void; testIDPrefix: string }) {
  const bounce = usePressBounce();
  return (
    <Animated.View style={[styles.cell, bounce.style]}>
      <Pressable
        testID={`${testIDPrefix}-${digit}`}
        accessibilityRole="button"
        accessibilityLabel={String(digit)}
        onPress={() => onPress(digit)}
        {...bounce.handlers}
        style={[styles.key, shadowStyle(shadow.card)]}
      >
        <Text variant="title2">{digit}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** 3 × 3 keypad (1–9) with large keys – used by the parent gate. */
export function NumberPad({
  onDigit,
  testIDPrefix = 'digit',
}: {
  onDigit: (d: number) => void;
  testIDPrefix?: string;
}) {
  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <Key key={d} digit={d} onPress={onDigit} testIDPrefix={testIDPrefix} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cell: { width: '30%' },
  key: {
    minHeight: touch.cta,
    borderRadius: radius.lg,
    backgroundColor: color.background.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
