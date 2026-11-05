import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { withAlpha } from '../styles/helpers.ts';
import { palette, spacing } from '../tokens.ts';
import { ActivityBar } from './ActivityBar.tsx';
import { FloatingPieces } from './FloatingPieces.tsx';
import { Mascot } from './Mascot.tsx';
import { Screen } from './Screen.tsx';
import { Sparkles } from './Sparkles.tsx';
import { Text } from './Text.tsx';

const STAGE = 240;
const RING = { rx: 112, ry: 28, cy: 150 };
const CX = STAGE / 2;
/** Upper half of the ring runs behind Pino, the lower half in front – reads as 3D. */
const BACK = `M${CX - RING.rx} ${RING.cy} A${RING.rx} ${RING.ry} 0 0 1 ${CX + RING.rx} ${RING.cy}`;
const FRONT = `M${CX + RING.rx} ${RING.cy} A${RING.rx} ${RING.ry} 0 0 1 ${CX - RING.rx} ${RING.cy}`;

function RingHalf({ d }: { d: string }) {
  return (
    <Svg width={STAGE} height={STAGE} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={d} fill="none" stroke={palette.neon} strokeOpacity={0.3} strokeWidth={10} strokeLinecap="round" />
      <Path d={d} fill="none" stroke={palette.neon} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

/** Glowing dot travelling on the ring; `front` decides which half this copy shows. */
function OrbitDot({ a, front }: { a: SharedValue<number>; front: boolean }) {
  const style = useAnimatedStyle(() => {
    const angle = a.get() * Math.PI * 2;
    const inFront = Math.sin(angle) > 0;
    return {
      opacity: inFront === front ? 1 : 0,
      transform: [
        { translateX: CX + RING.rx * Math.cos(angle) - 8 },
        { translateY: RING.cy + RING.ry * Math.sin(angle) - 8 },
        { scale: inFront ? 1 : 0.7 },
      ],
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function useOrbit() {
  const reduceMotion = useReduceMotion();
  const a = useSharedValue(0.25);
  useEffect(() => {
    if (reduceMotion) {
      a.set(0.25);
      return;
    }
    a.set(withRepeat(withTiming(1.25, { duration: 2600, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(a);
  }, [reduceMotion, a]);
  return a;
}

export interface LoadingScreenProps {
  title: string;
  /** Pino's short line, e.g. "Pino legt die Teile bereit …". */
  message: string;
  testID?: string;
}

/**
 * Full-screen loading moment in game style: Pino bobs inside a neon orbit, puzzle pieces drift
 * upwards and sparkles twinkle; a glowing bar shows that work is going on (no fake percentage).
 * Everything stands still with Reduced Motion. Announced as busy for screen readers.
 */
export function LoadingScreen({ title, message, testID }: LoadingScreenProps) {
  const orbit = useOrbit();
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
        <View style={styles.stage}>
          <Svg width={STAGE} height={STAGE} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient id="loading-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={palette.teal} stopOpacity={0.28} />
                <Stop offset="1" stopColor={palette.teal} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={CX} cy={226} rx={92} ry={12} fill="url(#loading-glow)" />
          </Svg>
          <RingHalf d={BACK} />
          <OrbitDot a={orbit} front={false} />
          <Sparkles>
            <Mascot emotion="greeting" size={190} animated accessibilityLabel={null} />
          </Sparkles>
          <RingHalf d={FRONT} />
          <OrbitDot a={orbit} front />
        </View>
        <View style={styles.text}>
          <Text variant="title1" align="center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="bodyLarge" align="center">
            {message}
          </Text>
        </View>
        <View style={styles.bar}>
          <ActivityBar />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  stage: { width: STAGE, height: STAGE, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.white,
    boxShadow: `0px 0px 12px ${withAlpha(palette.neon, 0.9)}`,
  },
  text: { gap: spacing.xs, paddingHorizontal: spacing.lg },
  bar: { alignSelf: 'stretch', paddingHorizontal: spacing.huge },
});
