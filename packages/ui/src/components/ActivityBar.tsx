import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { shadowStyle } from '../styles/helpers.ts';
import { color, gradient, palette, radius, shadow } from '../tokens.ts';

const SEGMENT = 0.42; // share of the track the glowing segment covers

/**
 * Without `progress`: "something is happening" – a lime → green segment glides through the track
 * (no number: the app never shows progress it does not really know).
 * With `progress` (0…1, real work done): the glowing fill grows from the left.
 */
export function ActivityBar({ progress }: { progress?: number }) {
  const determinate = progress !== undefined;
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  const t = useSharedValue(0);
  // determinate fill glides between updates instead of jumping
  const fill = useSharedValue(progress ?? 0);
  useEffect(() => {
    if (progress === undefined) return;
    const to = Math.max(0.04, Math.min(1, progress));
    fill.set(reduceMotion ? to : withTiming(to, { duration: 260, easing: Easing.linear }));
  }, [progress, fill, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: width * fill.get() }));
  useEffect(() => {
    if (determinate) {
      t.set(0);
      return;
    }
    if (reduceMotion || width === 0) {
      t.set(0.5);
      return;
    }
    t.set(withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true));
    return () => cancelAnimation(t);
  }, [reduceMotion, width, t, determinate]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: width * (1 - SEGMENT) * t.get() }],
  }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View style={[styles.track, shadowStyle(shadow.card)]} onLayout={onLayout} accessible={false}>
      <Animated.View style={[styles.segment, determinate ? fillStyle : [{ width: width * SEGMENT }, style]]}>
        <LinearGradient
          colors={gradient.brand.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: color.background.raised,
    borderWidth: 3,
    borderColor: palette.leaf100,
    overflow: 'hidden',
  },
  segment: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
});
