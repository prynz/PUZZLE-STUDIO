import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { palette, radius, spacing, spring, touch } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

/** Setting with a large, friendly on/off switch. The whole row is the touch target. */
export function ToggleRow({ label, description, value, onChange, disabled = false, testID }: ToggleRowProps) {
  const reduceMotion = useReduceMotion();
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.set(reduceMotion ? (value ? 1 : 0) : withSpring(value ? 1 : 0, spring.press));
  }, [value, x, reduceMotion]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: 24 * x.get() }] }));
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={description ? `${label}, ${description}` : label}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[styles.row, disabled ? styles.disabled : null]}
    >
      <View style={styles.text}>
        <Text variant="label">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.track, value ? styles.on : null]}>
        <Animated.View style={[styles.knob, knob]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: touch.child, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  track: { width: 56, height: 32, borderRadius: radius.pill, backgroundColor: palette.greyPurple300, padding: 4 },
  on: { backgroundColor: palette.mint600 },
  knob: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: palette.white },
  disabled: { opacity: 0.5 },
});
