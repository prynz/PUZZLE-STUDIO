import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle } from '../styles/helpers.ts';
import { color, pressScale, radius, shadow, spacing, spring, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** `compact` = 48 dp (e.g. "Überspringen"), default = child-sized 56 dp. */
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Quiet white pill for secondary actions. */
export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  size = 'default',
  style,
  testID,
}: SecondaryButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const height = size === 'compact' ? touch.min : touch.child;
  return (
    <Animated.View style={[animatedStyle, disabled && styles.disabled, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.set(withSpring(pressScale, spring.press));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, spring.press));
        }}
        style={[styles.pill, { minHeight: height }, shadowStyle(shadow.card)]}
      >
        <Text variant="label" tone="brand">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.pill,
    backgroundColor: color.background.raised,
    borderWidth: 2,
    borderColor: color.border.card,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
});
