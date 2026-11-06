import { useId, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { usePressBounce } from '../motion/usePressBounce.ts';
import { shadowStyle, withAlpha } from '../styles/helpers.ts';
import { gradient, palette, radius, shadow, spacing, type GradientToken } from '../tokens.ts';
import { Icon } from './Icon.tsx';
import { useSlideOffset } from './StoryCarousel.tsx';
import { knobHeight, pieceCardPath, type PieceCardShape } from './storyShapes.ts';
import { Text } from './Text.tsx';

export type StoryCardTone = 'brand' | 'sky' | 'sun';

const TONES: Record<StoryCardTone, GradientToken> = {
  brand: gradient.brand,
  sky: gradient.storySky,
  sun: gradient.storySun,
};

const SHAPE: PieceCardShape = { radius: radius.xl, knobRadius: 20, knobAt: 0.74, socketRadius: 16 };
const TOP = knobHeight(SHAPE.knobRadius);
const HEIGHT = 236;

export interface StoryCardProps {
  /** Small line above the title, e.g. "Kapitel 1" or "Weiter geht's". */
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: StoryCardTone;
  /** Picture on the right (Pino, a thumbnail …); slides a little slower than the card (parallax). */
  art?: ReactNode;
  /** Extra content under the text, e.g. a progress bar. */
  footer?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Story card shaped like a puzzle piece (knob on top, socket on the left) – used in a
 * StoryCarousel. Dark text on light gradients, the round arrow shows it can be tapped.
 */
export function StoryCard({
  eyebrow,
  title,
  subtitle,
  tone = 'brand',
  art,
  footer,
  onPress,
  accessibilityLabel,
  testID,
}: StoryCardProps) {
  const [width, setWidth] = useState(0);
  const gid = `story${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const bounce = usePressBounce();
  const offset = useSlideOffset();
  const parallax = useAnimatedStyle(() => ({ transform: [{ translateX: (offset?.get() ?? 0) * 46 }] }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const colors = TONES[tone].colors;

  return (
    <Animated.View style={bounce.style}>
      <Pressable
        {...bounce.handlers}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ')}
        onPress={onPress}
        onLayout={onLayout}
        style={styles.card}
      >
        {width > 0 ? (
          <Svg width={width} height={HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                {colors.map((c, i) => (
                  <Stop key={c} offset={i / (colors.length - 1)} stopColor={c} />
                ))}
              </LinearGradient>
            </Defs>
            <Path
              d={pieceCardPath(width, HEIGHT, SHAPE)}
              fill={`url(#${gid})`}
              stroke={withAlpha(palette.white, 0.7)}
              strokeWidth={2}
            />
          </Svg>
        ) : null}
        <View style={styles.body}>
          <View style={styles.text}>
            <View style={styles.eyebrow}>
              <Text variant="caption" tone="brand" numberOfLines={1}>
                {eyebrow}
              </Text>
            </View>
            <Text variant="title2" numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="label" numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
            {footer}
          </View>
        </View>
        {art ? (
          <Animated.View style={[styles.art, parallax]} pointerEvents="none">
            {art}
          </Animated.View>
        ) : null}
        <View style={styles.go} accessible={false}>
          <Icon name="forward" size={22} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** A picture for a StoryCard's `art`: a slightly tilted photo with a white frame. Decorative. */
export function StoryPicture({
  source,
  size = 100,
  tilt = 6,
}: {
  source: ImageSourcePropType;
  size?: number;
  tilt?: number;
}) {
  return (
    <View
      style={[styles.photo, shadowStyle(shadow.raised), { transform: [{ rotate: `${tilt}deg` }] }]}
      accessible={false}
    >
      <Image source={source} style={{ width: size, height: size, borderRadius: radius.sm }} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: HEIGHT },
  body: {
    flex: 1,
    marginTop: TOP,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.md,
  },
  text: { width: '62%', gap: spacing.xxs },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(palette.white, 0.75),
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.xxs,
  },
  go: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { position: 'absolute', right: spacing.xs, bottom: spacing.xxl },
  photo: { padding: 5, borderRadius: radius.md, backgroundColor: palette.white },
});
