import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { color, radius, spacing, spring, touch } from '../tokens.ts';
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
        <Animated.View style={[styles.knob, value ? styles.knobOn : null, knob]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: touch.child, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  // off: outlined track + dark knob, on: filled track + white knob (≥ 3:1 both ways, not color alone)
  track: {
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: color.control.off,
    padding: 2,
    justifyContent: 'center',
  },
  on: { backgroundColor: color.control.on, borderColor: color.control.on },
  knob: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: color.control.off },
  knobOn: { backgroundColor: color.control.knobOn },
  disabled: { opacity: 0.5 },
});
