import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { shadowStyle, withAlpha } from '../styles/helpers.ts';
import { gradient, palette, pressScale, radius, shadow, spacing, spring } from '../tokens.ts';
import { Text } from './Text.tsx';

export interface FeatureCardProps {
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  onPress: () => void;
  testID?: string;
}

/** Large hero card in Pino's lime → green gradient with dark text (≥ 6.4:1) for the main action of a screen. */
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
        <LinearGradient colors={gradient.brand.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.text}>
            <Text variant="title2" tone="primary">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="label" tone="primary">
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
  illustration: { marginRight: -spacing.xs },
});
