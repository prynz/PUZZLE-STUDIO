import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle } from '../styles/helpers.ts';
import { color, palette, pressScale, radius, shadow, spacing, spring, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface SelectionCardProps {
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  selected: boolean;
  onPress: () => void;
  tone?: 'leaf' | 'mint' | 'yellow' | 'peach' | 'sky';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const tones = {
  leaf: color.surface.leaf,
  mint: color.surface.mint,
  yellow: color.surface.yellow,
  peach: color.surface.peach,
  sky: color.surface.sky,
} as const;

/** Big tappable choice card with illustration (onboarding, settings). Behaves like a radio button. */
export function SelectionCard({
  title,
  subtitle,
  illustration,
  selected,
  onPress,
  tone = 'leaf',
  style,
  testID,
}: SelectionCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="radio"
        accessibilityState={{ selected, checked: selected }}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(pressScale, spring.press))}
        onPressOut={() => scale.set(withSpring(1, spring.press))}
        style={[
          styles.card,
          { backgroundColor: selected ? tones[tone] : color.background.raised },
          selected ? styles.selected : null,
          shadowStyle(selected ? shadow.raised : shadow.card),
        ]}
      >
        {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
        <View style={styles.text}>
          <Text variant="title3">{title}</Text>
          {subtitle ? <Text variant="body">{subtitle}</Text> : null}
        </View>
        <View style={[styles.radio, selected ? styles.radioOn : null]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: touch.cta + spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: color.border.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  selected: { borderColor: palette.leaf },
  illustration: { width: 72, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: palette.leaf200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.background.raised,
  },
  radioOn: { borderColor: color.brand.main },
  radioDot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: color.brand.main },
});
