import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { color, duration, fontFace, palette, spacing, spring } from '../tokens.ts';
import { Icon, type NavIconName } from './Icon.tsx';
import { NAV_BAR_HEIGHT, NAV_BUBBLE, NAV_BUBBLE_RISE, navInset, notchedBarPath, tabCenter } from './navShape.ts';
import { Text } from './Text.tsx';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: NavIconName;
}

export interface BottomNavigationProps {
  items: readonly BottomNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

/** Height of the bar incl. the bubble above it and its bottom offset – screens add this as bottom inset. */
export const BOTTOM_NAV_HEIGHT = NAV_BAR_HEIGHT + NAV_BUBBLE_RISE + spacing.md;

const AnimatedPath = Animated.createAnimatedComponent(Path);
/** Soft shadow drawn as the bar outline itself, slightly lower – so it follows the notch too. */
const SHADOW_LAYERS = [
  { dy: 1, opacity: 0.05 },
  { dy: 3, opacity: 0.04 },
  { dy: 6, opacity: 0.03 },
] as const;
const SHADOW_ROOM = 8;
/** Shadow only below the notch – nothing may shine through inside the dip. */
const SHADOW_FROM = 44;

function TabItem({
  item,
  active,
  onSelect,
  width,
  reach,
}: {
  item: BottomNavItem;
  active: boolean;
  onSelect: (key: string) => void;
  width: number;
  /** Extra touch area towards the bar edge (outer tabs). */
  reach: { left: number; right: number };
}) {
  const shown = useSharedValue(active ? 0 : 1);
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    const to = active ? 0 : 1;
    shown.set(reduceMotion ? to : withTiming(to, { duration: duration.fast }));
  }, [active, shown, reduceMotion]);
  // the active icon lives in the bubble – the slot only keeps its (bold) name
  const iconStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ scale: 0.6 + 0.4 * shown.get() }],
  }));
  return (
    <Pressable
      testID={`tab-${item.key}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={item.label}
      onPress={() => onSelect(item.key)}
      hitSlop={reach}
      style={[styles.item, { width }]}
    >
      <Animated.View style={iconStyle}>
        <Icon name={item.icon} />
      </Animated.View>
      <Text variant="caption" numberOfLines={1} style={active ? styles.labelActive : styles.label}>
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * Bottom tab bar: a white bar with a soft notch; the active tab sits in a round purple bubble
 * above it. On a tab change notch and bubble glide over with a spring and the icon pops in.
 * Without motion (Reduced Motion) the bubble simply jumps.
 */
export function BottomNavigation({ items, activeKey, onSelect }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const screen = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    items.findIndex((it) => it.key === activeKey),
  );
  const active = items[index];
  const count = items.length;
  const x = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (width === 0) return;
    const to = tabCenter(width, count, index);
    if (reduceMotion || x.get() === 0) {
      x.set(to);
      return;
    }
    x.set(withSpring(to, spring.glide));
    pop.set(withSequence(withTiming(0.7, { duration: duration.fast }), withSpring(1, spring.bouncy)));
  }, [width, index, count, reduceMotion, x, pop]);

  const barProps = useAnimatedProps(() => ({ d: notchedBarPath(width, NAV_BAR_HEIGHT, x.get()) }));
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() - NAV_BUBBLE / 2 }, { scale: pop.get() }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const inset = width > 0 ? navInset(width, count) : 0;
  const slot = width > 0 ? (width - 2 * inset) / count : 0;
  // narrow phones: less outer margin so every tab keeps a child-sized touch area
  const margin = screen.width < 360 ? spacing.xs : spacing.md;

  return (
    <View
      style={[styles.wrap, { left: margin, right: margin, bottom: Math.max(insets.bottom, spacing.sm) }]}
      accessibilityRole="tablist"
    >
      <View style={styles.bar} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={NAV_BAR_HEIGHT + SHADOW_ROOM} style={styles.shape}>
            <Defs>
              <ClipPath id="nav-shadow">
                <Rect x={0} y={SHADOW_FROM} width={width} height={NAV_BAR_HEIGHT + SHADOW_ROOM - SHADOW_FROM} />
              </ClipPath>
            </Defs>
            <G clipPath="url(#nav-shadow)">
              {SHADOW_LAYERS.map((l) => (
                <G key={l.dy} transform={`translate(0 ${l.dy})`}>
                  <AnimatedPath animatedProps={barProps} fill={palette.navy} fillOpacity={l.opacity} />
                </G>
              ))}
            </G>
            <AnimatedPath animatedProps={barProps} fill={color.background.raised} />
          </Svg>
        ) : null}
        <View style={[styles.row, { paddingHorizontal: inset }]}>
          {items.map((it, i) => (
            <TabItem
              key={it.key}
              item={it}
              active={it.key === activeKey}
              onSelect={onSelect}
              width={slot}
              reach={{ left: i === 0 ? inset : 0, right: i === count - 1 ? inset : 0 }}
            />
          ))}
        </View>
      </View>
      {width > 0 && active ? (
        <Animated.View style={[styles.bubble, bubbleStyle]} pointerEvents="none">
          <Icon name={active.icon} active size={32} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', paddingTop: NAV_BUBBLE_RISE },
  bar: { height: NAV_BAR_HEIGHT },
  shape: { position: 'absolute', top: 0, left: 0 },
  row: { flex: 1, flexDirection: 'row' },
  item: {
    minHeight: NAV_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
    gap: 2,
  },
  label: { color: color.text.secondary },
  // active: same size (no truncation), darker and extra bold
  labelActive: { color: color.text.primary, fontFamily: fontFace['800'] },
  bubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: NAV_BUBBLE,
    height: NAV_BUBBLE,
    borderRadius: NAV_BUBBLE / 2,
    backgroundColor: color.brand.purple,
    borderWidth: 4,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
