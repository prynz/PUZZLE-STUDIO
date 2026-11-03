import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { duration, spring } from '../tokens.ts';

export interface AppearProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** fade (default) · rise (fade + slide up a little) · pop (fade + gentle spring scale) */
  variant?: 'fade' | 'rise' | 'pop';
  /** ms – for lists use `staggerDelay(index)`. */
  delay?: number;
}

/** Delay for the n-th item of a list: items appear one after another, but never slowly. */
export const staggerDelay = (index: number, step = 45, max = 360) => Math.min(index * step, max);

/**
 * Gentle entrance for screen content.
 *
 * Deliberately NOT a Reanimated layout animation (`entering={FadeIn}`): with
 * system animations disabled (Android "Remove animations" / animator scale 0)
 * those can stay at opacity 0 and hide content from users and screen readers.
 * Here, Reduced Motion shows content immediately and fully.
 */
export function Appear({ children, style, variant = 'fade', delay = 0 }: AppearProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    const to = variant === 'pop' ? withSpring(1, spring.bouncy) : withTiming(1, { duration: duration.gentle });
    progress.set(withDelay(delay, to));
  }, [reduceMotion, progress, variant, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const opacity = Math.min(1, p);
    if (variant === 'rise') return { opacity, transform: [{ translateY: (1 - Math.min(1, p)) * 14 }] };
    if (variant === 'pop') return { opacity, transform: [{ scale: 0.6 + 0.4 * p }] };
    return { opacity };
  });
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
