import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle, withAlpha } from '../styles/helpers.ts';
import { palette, pressScale, radius, shadow, spacing, spring } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface FeatureCardProps {
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  onPress: () => void;
  testID?: string;
}

/** Large lavender hero card for the main action of a screen (e.g. "Puzzle erstellen"). */
export function FeatureCard({ title, subtitle, illustration, onPress, testID }: FeatureCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Animated.View style={[animatedStyle, shadowStyle(shadow.raised), styles.shell]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(pressScale, spring.press))}
        onPressOut={() => scale.set(withSpring(1, spring.press))}
      >
        <LinearGradient
          colors={[palette.lavender200, palette.lavender, palette.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.text}>
            <Text variant="title2" tone="onPrimary" style={styles.shadowText}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="label" tone="onPrimary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: radius.lg },
  card: {
    minHeight: 150,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: withAlpha(palette.white, 0.6),
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: { flex: 1, gap: spacing.xxs },
  shadowText: {
    textShadowColor: withAlpha(palette.purple700, 0.4),
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  illustration: { marginRight: -spacing.xs },
});
