import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration } from '../tokens.ts';

export interface AppearProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gentle fade-in for screen content.
 *
 * Deliberately NOT a Reanimated layout animation (`entering={FadeIn}`): with
 * system animations disabled (Android "Remove animations" / animator scale 0)
 * those can stay at opacity 0 and hide content from users and screen readers.
 * Here, Reduced Motion shows content immediately and fully.
 */
export function Appear({ children, style }: AppearProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    opacity.set(reduceMotion ? 1 : withTiming(1, { duration: duration.gentle }));
  }, [reduceMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
