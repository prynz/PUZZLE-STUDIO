import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressBounce } from '../motion/usePressBounce.ts';
import { color, palette, radius, spacing, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface Segment<K extends string> {
  key: K;
  label: string;
}

export interface SegmentedControlProps<K extends string> {
  segments: readonly Segment<K>[];
  value: K;
  onChange: (key: K) => void;
  testIDPrefix?: string;
}

function SegmentButton<K extends string>(p: {
  segment: Segment<K>;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const bounce = usePressBounce();
  return (
    <Animated.View style={[styles.flex, bounce.style]}>
      <Pressable
        testID={p.testID}
        accessibilityRole="tab"
        accessibilityState={{ selected: p.active }}
        accessibilityLabel={p.segment.label}
        onPress={p.onPress}
        {...bounce.handlers}
        style={[styles.segment, p.active ? styles.active : null]}
      >
        <Text
          variant="label"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ color: p.active ? color.brand.strong : color.text.secondary }}
        >
          {p.segment.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Switch between a few areas of one screen (fewer scrolling than one long page). One row, equal widths. */
export function SegmentedControl<K extends string>({
  segments,
  value,
  onChange,
  testIDPrefix,
}: SegmentedControlProps<K>) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {segments.map((s) => (
        <SegmentButton
          key={s.key}
          segment={s}
          active={s.key === value}
          onPress={() => onChange(s.key)}
          {...(testIDPrefix ? { testID: `${testIDPrefix}-${s.key}` } : {})}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.xxs,
    padding: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: palette.leaf100,
  },
  flex: { flex: 1 },
  segment: {
    minHeight: touch.min,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  active: { backgroundColor: color.background.raised },
});
