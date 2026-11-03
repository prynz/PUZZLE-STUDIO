import { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { pressScale, spring } from '../tokens.ts';

/**
 * Soft "boop" while a child presses something (scale 0.96 → 1 with a spring).
 * Off with Reduced Motion. Spread `handlers` on the Pressable, `style` on an Animated.View.
 */
export function usePressBounce() {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const handlers = {
    onPressIn: () => {
      if (!reduceMotion) scale.set(withSpring(pressScale, spring.press));
    },
    onPressOut: () => {
      if (!reduceMotion) scale.set(withSpring(1, spring.press));
    },
  };
  return { style, handlers };
}
