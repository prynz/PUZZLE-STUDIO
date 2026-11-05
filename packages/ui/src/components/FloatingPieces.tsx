import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { palette } from '../tokens.ts';

/** Small rounded jigsaw piece (same family as Pino), viewBox 0 0 40 40. */
const PIECE =
  'M8 12 Q8 8 12 8 H15 A4.5 4.5 0 1 1 25 8 H28 Q32 8 32 12 V15 A4.5 4.5 0 1 1 32 25 V28 Q32 32 28 32 H12 Q8 32 8 28Z';

interface Floater {
  x: number; // 0..1 of the width
  size: number;
  color: string;
  duration: number; // one trip bottom → top
  delay: number;
  sway: number;
  spin: number;
  start: number; // 0..1 – where on its trip the piece is when the screen opens
}

const FLOATERS: readonly Floater[] = [
  { x: 0.08, size: 30, color: palette.lime, duration: 11000, delay: 0, sway: 14, spin: 160, start: 0.15 },
  { x: 0.22, size: 22, color: palette.leaf, duration: 14000, delay: 600, sway: 10, spin: -120, start: 0.6 },
  { x: 0.4, size: 18, color: palette.sky, duration: 12500, delay: 200, sway: 8, spin: 200, start: 0.85 },
  { x: 0.58, size: 26, color: palette.leaf600, duration: 15000, delay: 900, sway: 12, spin: -180, start: 0.35 },
  { x: 0.74, size: 20, color: palette.yellow, duration: 13000, delay: 300, sway: 9, spin: 140, start: 0.05 },
  { x: 0.88, size: 28, color: palette.lime, duration: 12000, delay: 1200, sway: 13, spin: -150, start: 0.55 },
  { x: 0.3, size: 16, color: palette.peach, duration: 16000, delay: 1500, sway: 7, spin: 220, start: 0.25 },
  { x: 0.66, size: 14, color: palette.leaf, duration: 17000, delay: 500, sway: 6, spin: -200, start: 0.75 },
];

function Piece({ f, height, width, still }: { f: Floater; height: number; width: number; still: boolean }) {
  const t = useSharedValue(f.start);
  useEffect(() => {
    if (still) {
      t.set(f.start);
      return;
    }
    // finish the current trip, then loop forever (linear: a calm, steady drift)
    t.set(
      withDelay(
        f.delay,
        withTiming(1, { duration: f.duration * (1 - f.start), easing: Easing.linear }, () => {
          t.set(0);
          t.set(withRepeat(withTiming(1, { duration: f.duration, easing: Easing.linear }), -1, false));
        }),
      ),
    );
    return () => cancelAnimation(t);
  }, [still, t, f]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: 0.32 * Math.sin(Math.PI * p) + 0.08,
      transform: [
        { translateX: Math.sin(p * Math.PI * 4) * f.sway },
        { translateY: height + 40 - p * (height + 100) },
        { rotate: `${p * f.spin}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.piece, { left: f.x * width - f.size / 2 }, style]}>
      <Svg width={f.size} height={f.size} viewBox="0 0 40 40">
        <Path d={PIECE} fill={f.color} />
      </Svg>
    </Animated.View>
  );
}

/** Puzzle pieces drifting gently upwards behind loading content (static with Reduced Motion). */
export function FloatingPieces() {
  const { width, height } = useWindowDimensions();
  const still = useReduceMotion();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      {FLOATERS.map((f, i) => (
        <Piece key={i} f={f} width={width} height={height} still={still} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ piece: { position: 'absolute', top: 0 } });
