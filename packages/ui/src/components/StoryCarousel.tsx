import { Children, createContext, useContext, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { palette, radius, spacing } from '../tokens.ts';

/** Where a slide stands relative to the centre: 0 = in focus, −1 = one to the left, 1 = one to the right. */
const SlideContext = createContext<DerivedValue<number> | null>(null);

/** Inside a StoryCarousel slide: its live offset from the focus (null outside a carousel). */
export function useSlideOffset(): DerivedValue<number> | null {
  return useContext(SlideContext);
}

export interface StoryCarouselProps {
  children: ReactNode;
  /** Side gutter of the screen – the carousel bleeds into it so cards can slide in from the edge. */
  bleed?: number;
  /** How much of the next card peeks in (dp). */
  peek?: number;
  /** Space above the cards for artwork that sticks out. */
  headroom?: number;
  onIndexChange?: (index: number) => void;
  testID?: string;
}

const GAP = spacing.sm;

/**
 * Swipeable row of story cards: one card in focus, the next one peeking in. Cards further away
 * shrink and tilt a little, the dots stretch to show the position. With Reduced Motion the cards
 * simply slide (no tilt/scale).
 */
export function StoryCarousel({
  children,
  bleed = spacing.xl,
  peek = spacing.xxxl,
  headroom = spacing.xl,
  onIndexChange,
  testID,
}: StoryCarouselProps) {
  const { width: screen } = useWindowDimensions();
  const slides = Children.toArray(children);
  const cardWidth = Math.max(220, screen - 2 * bleed - peek);
  const interval = cardWidth + GAP;
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
  });
  const settle = (offset: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, Math.round(offset / interval)));
    if (next !== index) {
      setIndex(next);
      onIndexChange?.(next);
    }
  };

  return (
    <View style={{ marginHorizontal: -bleed }} testID={testID}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(e) => settle(e.nativeEvent.contentOffset.x)}
        contentContainerStyle={{ paddingHorizontal: bleed, paddingTop: headroom, gap: GAP }}
      >
        {slides.map((slide, i) => (
          <Slide key={i} index={i} interval={interval} x={x} width={cardWidth}>
            {slide}
          </Slide>
        ))}
      </Animated.ScrollView>
      {slides.length > 1 ? (
        <View style={styles.dots} accessible={false}>
          {slides.map((_, i) => (
            <Dot key={i} index={i} interval={interval} x={x} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

interface SlideProps {
  index: number;
  interval: number;
  x: SharedValue<number>;
  width: number;
  children: ReactNode;
}

function Slide({ index, interval, x, width, children }: SlideProps) {
  const reduceMotion = useReduceMotion();
  const offset = useDerivedValue(() =>
    reduceMotion ? 0 : interpolate(x.get() / interval - index, [-1, 0, 1], [-1, 0, 1], Extrapolation.CLAMP),
  );
  const style = useAnimatedStyle(() => {
    const p = offset.get();
    const away = Math.abs(p);
    return {
      opacity: 1 - 0.25 * away,
      transform: [{ translateY: 10 * away }, { scale: 1 - 0.08 * away }, { rotate: `${-4 * p}deg` }],
    };
  });
  return (
    <SlideContext.Provider value={offset}>
      <Animated.View style={[{ width }, style]}>{children}</Animated.View>
    </SlideContext.Provider>
  );
}

function Dot({ index, interval, x }: { index: number; interval: number; x: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const near = Math.max(0, 1 - Math.abs(x.get() / interval - index));
    return { width: 8 + 18 * near, opacity: 0.35 + 0.65 * near };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxs + 2, marginTop: spacing.sm },
  dot: { height: 8, borderRadius: radius.pill, backgroundColor: palette.leaf700 },
});
