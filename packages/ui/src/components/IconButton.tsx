import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle } from '../styles/helpers.ts';
import { color, pressScale, radius, shadow, spring, touch } from '../tokens.ts';

export interface IconButtonProps {
  icon: ReactNode;
  /** Required: icon-only buttons must be announced. */
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  testID?: string;
}

/** Round icon-only button (back, pause, parents' lock …). Min. 48 dp. */
export function IconButton({ icon, accessibilityLabel, onPress, size = 52, testID }: IconButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const s = Math.max(size, touch.min);
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(pressScale, spring.press))}
        onPressOut={() => scale.set(withSpring(1, spring.press))}
        style={[styles.btn, { width: s, height: s }, shadowStyle(shadow.card)]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    backgroundColor: color.background.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
