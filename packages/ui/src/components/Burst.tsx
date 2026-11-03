import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { palette, radius } from '../tokens.ts';
import { useReduceMotion } from '../motion/MotionProvider.tsx';

const COUNT = 8;
const DURATION = 650;

function Dot({ i, p, reach }: { i: number; p: SharedValue<number>; reach: number }) {
  const angle = (i / COUNT) * Math.PI * 2;
  const size = i % 2 ? 9 : 13;
  const style = useAnimatedStyle(() => {
    const d = reach * 0.35 + reach * p.get();
    return {
      opacity: 1 - p.get() * p.get() * p.get(),
      transform: [
        { translateX: Math.cos(angle) * d - size / 2 },
        { translateY: Math.sin(angle) * d - size / 2 },
        { scale: 1 - p.get() * 0.5 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.dot,
        { width: size, height: size, backgroundColor: i % 2 ? palette.yellow : palette.yellow600 },
        style,
      ]}
    />
  );
}

export interface BurstProps {
  /** Centre in the parent's coordinates. */
  x: number;
  y: number;
  /** Size of the thing that sparkles (reach of the dots). */
  size: number;
  /** Change it to play the burst again. */
  seq: number;
}

/**
 * Short, soft burst of golden dots (a piece snapped in). Decorative, ignores touches,
 * not shown at all with Reduced Motion.
 */
export function Burst({ x, y, size, seq }: BurstProps) {
  const reduceMotion = useReduceMotion();
  const p = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    p.set(0);
    p.set(withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }));
  }, [seq, p, reduceMotion]);
  if (reduceMotion) return null;
  const reach = Math.max(18, size * 0.45);
  return (
    <View pointerEvents="none" style={[styles.origin, { left: x, top: y }]}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Dot key={i} i={i} p={p} reach={reach} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', width: 0, height: 0 },
  dot: { position: 'absolute', left: 0, top: 0, borderRadius: radius.pill },
});
