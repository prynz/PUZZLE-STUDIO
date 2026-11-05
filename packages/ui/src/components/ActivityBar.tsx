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
 * "Something is happening" bar without a number: a lime → green segment glides through the
 * track. No percentage on purpose – the app never shows progress it does not really know.
 */
export function ActivityBar() {
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion || width === 0) {
      t.set(0.5);
      return;
    }
    t.set(withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true));
    return () => cancelAnimation(t);
  }, [reduceMotion, width, t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: width * (1 - SEGMENT) * t.get() }],
  }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View style={[styles.track, shadowStyle(shadow.card)]} onLayout={onLayout} accessible={false}>
      <Animated.View style={[styles.segment, { width: width * SEGMENT }, style]}>
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
