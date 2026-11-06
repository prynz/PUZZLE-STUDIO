import { useId, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop, SvgXml } from 'react-native-svg';

import { starIcon } from '../illustrations/rewards.ts';
import { usePressBounce } from '../motion/usePressBounce.ts';
import { shadowStyle, withAlpha } from '../styles/helpers.ts';
import { gradient, palette, radius, shadow, spacing, type GradientToken } from '../tokens.ts';
import { Icon } from './Icon.tsx';
import { useSlideOffset } from './StoryCarousel.tsx';
import { knobHeight, pieceCardPath, type PieceCardShape } from './storyShapes.ts';
import { Text } from './Text.tsx';

export type StoryCardTone = 'brand' | 'sky' | 'sun' | 'ember';

const TONES: Record<StoryCardTone, GradientToken> = {
  brand: gradient.brand,
  sky: gradient.storySky,
  sun: gradient.storySun,
  ember: gradient.storyEmber,
};

// asymmetric: big soft corners top left and bottom right, tighter ones where the knob and the arrow sit
const SHAPE: PieceCardShape = {
  radii: [radius.sheet, radius.md, radius.sheet, radius.md],
  knobRadius: 18,
  knobAt: 0.72,
};
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
 * Story card shaped like a puzzle piece (asymmetric corners, soft knob on top) – used in a
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

/** Art for a StoryCard: three stars on a little podium (big one in the middle), lit up to `stars`. Decorative. */
export function StoryStars({ stars }: { stars: number }) {
  const sizes = [36, 58, 36];
  const order = [1, 0, 2]; // the middle star lights up first
  return (
    <View style={styles.stars} accessible={false}>
      {sizes.map((size, i) => (
        <View key={i} style={{ marginBottom: i === 1 ? spacing.lg : 0, transform: [{ rotate: `${(i - 1) * 14}deg` }] }}>
          <SvgXml xml={starIcon((order[i] ?? 0) < stars, size)} width={size} height={size} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: HEIGHT },
  body: {
    flex: 1,
    marginTop: TOP,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl,
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
  stars: { flexDirection: 'row', alignItems: 'flex-end', marginRight: spacing.xs, marginBottom: spacing.huge },
  photo: { padding: 5, borderRadius: radius.md, backgroundColor: palette.white },
});
