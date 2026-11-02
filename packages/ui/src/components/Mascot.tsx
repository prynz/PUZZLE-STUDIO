import { useEffect, useId, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { MASCOT_EMOTIONS, pinoSvg, type MascotEmotion } from '../mascot/pino.ts';

export interface MascotProps {
  emotion?: MascotEmotion;
  /** Rendered width/height in dp (min. 64 for a readable face). */
  size?: number;
  /** Gentle idle bob (≤ 3 %), automatically off with Reduced Motion. */
  animated?: boolean;
  /** Overrides the default label ("Pino – <emotion>"); pass `null` for purely decorative use. */
  accessibilityLabel?: string | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** The only way to show Pino in the app (see docs/design/mascot-guidelines.md). */
export function Mascot({
  emotion = 'greeting',
  size = 160,
  animated = false,
  accessibilityLabel,
  style,
  testID,
}: MascotProps) {
  const reactId = useId();
  const idPrefix = `pino${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const xml = useMemo(() => pinoSvg(emotion, idPrefix), [emotion, idPrefix]);
  const reduceMotion = useReducedMotion();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!animated || reduceMotion) {
      bob.set(0);
      return;
    }
    bob.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(bob);
  }, [animated, reduceMotion, bob]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.get() * size * 0.03 }, { scale: 1 + bob.get() * 0.015 }],
  }));

  const label = accessibilityLabel === undefined ? `Pino – ${MASCOT_EMOTIONS[emotion].label}` : accessibilityLabel;
  const a11y =
    label === null
      ? { accessible: false }
      : { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: label };

  return (
    <View style={[{ width: size, height: size }, style]} testID={testID} {...a11y}>
      <Animated.View style={animatedStyle}>
        <SvgXml xml={xml} width={size} height={size} />
      </Animated.View>
    </View>
  );
}
