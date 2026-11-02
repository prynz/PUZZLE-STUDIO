import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle } from '../styles/helpers.ts';
import { color, pressScale, radius, shadow, spacing, spring } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface ActionTileProps {
  label: string;
  illustration: ReactNode;
  onPress: () => void;
  tone?: keyof typeof color.surface;
  disabled?: boolean;
  testID?: string;
}

/** Square illustrated action (camera, gallery, samples). */
export function ActionTile({ label, illustration, onPress, tone = 'sky', disabled = false, testID }: ActionTileProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Animated.View style={[styles.wrap, animatedStyle, disabled ? styles.disabled : null]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(pressScale, spring.press))}
        onPressOut={() => scale.set(withSpring(1, spring.press))}
        style={[styles.tile, { backgroundColor: color.surface[tone] }, shadowStyle(shadow.card)]}
      >
        <View style={styles.art}>{illustration}</View>
        <Text variant="label" align="center">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tile: {
    minHeight: 128,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: color.border.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  art: { height: 60, justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
