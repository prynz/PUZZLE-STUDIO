import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle } from '../styles/helpers.ts';
import { color, gradient, pressScale, radius, shadow, spacing, spring, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export type PrimaryButtonVariant = 'primary' | 'accent';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  /** `accent` (deep glossy green) = main "go" actions, `primary` (green) = confirm / continue. Both white labels. */
  variant?: PrimaryButtonVariant;
  /** Shows the round chevron badge on the right (default true). */
  showChevron?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function Chevron({ tint }: { tint: string }): ReactNode {
  // Two rounded bars form a soft chevron – no icon font needed.
  return (
    <View style={styles.chevron} accessible={false}>
      <View
        style={[styles.chevBar, { backgroundColor: tint, transform: [{ translateY: -3.5 }, { rotate: '45deg' }] }]}
      />
      <View
        style={[styles.chevBar, { backgroundColor: tint, transform: [{ translateY: 3.5 }, { rotate: '-45deg' }] }]}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'accent',
  showChevron = true,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? color.text.onPrimary : color.text.onAccent;

  return (
    <Animated.View style={[animatedStyle, disabled && styles.disabled, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        {...(accessibilityHint !== undefined ? { accessibilityHint } : {})}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.set(withSpring(pressScale, spring.press));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, spring.press));
        }}
        style={[styles.shell, shadowStyle(shadow.raised)]}
      >
        <LinearGradient
          colors={isPrimary ? gradient.buttonPrimary.colors : gradient.buttonAccent.colors}
          style={styles.fill}
        >
          <Text variant="button" tone="onPrimary" numberOfLines={1}>
            {label}
          </Text>
          {showChevron ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
              <Chevron tint={fg} />
            </View>
          ) : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.pill,
    minHeight: touch.cta,
  },
  fill: {
    minHeight: touch.cta,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: color.border.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.huge,
  },
  badge: {
    position: 'absolute',
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { width: 12, height: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 3 },
  chevBar: { position: 'absolute', width: 10, height: 3.2, borderRadius: 2 },
  disabled: { opacity: 0.5 },
});
