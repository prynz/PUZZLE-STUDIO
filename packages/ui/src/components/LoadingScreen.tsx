import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { withAlpha } from '../styles/helpers.ts';
import { palette, spacing } from '../tokens.ts';
import { ActivityBar } from './ActivityBar.tsx';
import { FloatingPieces } from './FloatingPieces.tsx';
import { Mascot } from './Mascot.tsx';
import { Screen } from './Screen.tsx';
import { Text } from './Text.tsx';

const PINO = 220;
const FLOAT = 10; // dp up and down
const FLOAT_MS = 1800; // one way – a calm breath

/** Pino floats gently; his soft shadow on the ground shrinks a little while he rises. */
function FloatingPino() {
  const reduceMotion = useReduceMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      t.set(0);
      return;
    }
    t.set(withRepeat(withTiming(1, { duration: FLOAT_MS, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(t);
  }, [reduceMotion, t]);
  const body = useAnimatedStyle(() => ({ transform: [{ translateY: -FLOAT * t.get() }] }));
  const shadow = useAnimatedStyle(() => ({
    opacity: 1 - 0.35 * t.get(),
    transform: [{ scaleX: 1 - 0.12 * t.get() }],
  }));
  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.shadow, shadow]} />
      <Animated.View style={body}>
        <Mascot emotion="excited" size={PINO} accessibilityLabel={null} />
      </Animated.View>
    </View>
  );
}

export interface LoadingScreenProps {
  title: string;
  /** Pino's short line, e.g. "Deine Puzzles bereiten sich vor.". */
  message: string;
  /** Real share of finished work (0…1). Shows a filling bar with percentage; omit when unknown. */
  progress?: number;
  testID?: string;
}

/**
 * App-start preloader in game style: Pino (holding a puzzle piece) floats gently while puzzle
 * pieces drift upwards in the background; a glowing bar shows the loading progress.
 * Everything stands still with Reduced Motion. Announced as busy for screen readers.
 */
export function LoadingScreen({ title, message, progress, testID }: LoadingScreenProps) {
  const percent = progress === undefined ? null : Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <Screen background="dream" decor="meadow">
      <FloatingPieces />
      <View
        style={styles.center}
        testID={testID}
        accessibilityState={{ busy: true }}
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${title} ${message}`}
      >
        <FloatingPino />
        <View style={styles.text}>
          <Text variant="title1" align="center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="bodyLarge" align="center">
            {message}
          </Text>
        </View>
        <View
          style={styles.bar}
          accessibilityRole="progressbar"
          {...(percent === null ? {} : { accessibilityValue: { min: 0, max: 100, now: percent } })}
        >
          <ActivityBar {...(progress === undefined ? {} : { progress })} />
          {percent === null ? null : (
            <Text variant="label" tone="brand" align="center" testID="loading-percent">
              {`${percent} %`}
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  stage: { width: PINO, height: PINO + FLOAT + 16, alignItems: 'center', justifyContent: 'flex-end' },
  shadow: {
    position: 'absolute',
    bottom: 0,
    width: PINO * 0.62,
    height: 18,
    borderRadius: 999,
    backgroundColor: withAlpha(palette.teal, 0.16),
    boxShadow: `0px 0px 14px ${withAlpha(palette.teal, 0.22)}`,
  },
  text: { gap: spacing.xs, paddingHorizontal: spacing.lg },
  bar: { alignSelf: 'stretch', paddingHorizontal: spacing.huge, gap: spacing.xs },
});
