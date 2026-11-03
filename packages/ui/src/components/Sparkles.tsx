import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { starIcon } from '../illustrations/rewards.ts';
import { useReduceMotion } from '../motion/MotionProvider.tsx';

/** Positions around the child (fractions of the box) and their twinkle offsets. */
const SPOTS = [
  { x: 0.02, y: 0.18, s: 16, d: 0 },
  { x: 0.86, y: 0.08, s: 20, d: 260 },
  { x: 0.92, y: 0.62, s: 14, d: 520 },
  { x: 0.06, y: 0.7, s: 18, d: 780 },
  { x: 0.48, y: -0.04, s: 12, d: 1040 },
] as const;

function Twinkle({ spot, t }: { spot: (typeof SPOTS)[number]; t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * t.get(),
    transform: [{ scale: 0.7 + 0.3 * t.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spot, { left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }, style]}
    >
      <SvgXml xml={starIcon(true, spot.s)} width={spot.s} height={spot.s} />
    </Animated.View>
  );
}

function useTwinkle(delay: number, reduceMotion: boolean) {
  const t = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      t.set(1);
      return;
    }
    t.set(
      withDelay(
        delay,
        withRepeat(withSequence(withTiming(0, { duration: 700 }), withTiming(1, { duration: 700 })), -1),
      ),
    );
  }, [t, delay, reduceMotion]);
  return t;
}

/** A few softly twinkling stars around something special (celebration, unlocked milestone). Decorative. */
export function Sparkles({ children }: { children: ReactNode }) {
  const reduceMotion = useReduceMotion();
  const t0 = useTwinkle(SPOTS[0].d, reduceMotion);
  const t1 = useTwinkle(SPOTS[1].d, reduceMotion);
  const t2 = useTwinkle(SPOTS[2].d, reduceMotion);
  const t3 = useTwinkle(SPOTS[3].d, reduceMotion);
  const t4 = useTwinkle(SPOTS[4].d, reduceMotion);
  const ts = [t0, t1, t2, t3, t4];
  return (
    <View style={styles.wrap}>
      {children}
      {SPOTS.map((spot, i) => (
        <Twinkle key={i} spot={spot} t={ts[i] as SharedValue<number>} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', paddingHorizontal: 24 },
  spot: { position: 'absolute' },
});
