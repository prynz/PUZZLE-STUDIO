import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { shadowStyle } from '../styles/helpers.ts';
import { color, duration, palette, radius, shadow, spacing, spring } from '../tokens.ts';
import { Icon, type NavIconName } from './Icon.tsx';
import { NAV_BAR_HEIGHT, NAV_BUBBLE, NAV_BUBBLE_RISE, notchedBarPath, tabCenter } from './navShape.ts';
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

function TabItem({
  item,
  active,
  onSelect,
}: {
  item: BottomNavItem;
  active: boolean;
  onSelect: (key: string) => void;
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
      style={styles.item}
    >
      <Animated.View style={iconStyle}>
        <Icon name={item.icon} />
      </Animated.View>
      <Text
        variant={active ? 'label' : 'caption'}
        numberOfLines={1}
        style={{ color: active ? color.text.primary : color.text.secondary }}
      >
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
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    items.findIndex((it) => it.key === activeKey),
  );
  const active = items[index];
  const x = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (width === 0) return;
    const to = tabCenter(width, items.length, index);
    if (reduceMotion || x.get() === 0) {
      x.set(to);
      return;
    }
    x.set(withSpring(to, spring.glide));
    pop.set(withSequence(withTiming(0.7, { duration: duration.fast }), withSpring(1, spring.bouncy)));
  }, [width, index, items.length, reduceMotion, x, pop]);

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() - 1.5 * width }] }));
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() - NAV_BUBBLE / 2 }, { scale: pop.get() }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.sm) }]} accessibilityRole="tablist">
      <View style={[styles.shadow, shadowStyle(shadow.raised)]} onLayout={onLayout}>
        <View style={styles.clip}>
          {width > 0 ? (
            <Animated.View style={[styles.shape, { width: 3 * width }, barStyle]}>
              <Svg width={3 * width} height={NAV_BAR_HEIGHT}>
                <Path d={notchedBarPath(3 * width, NAV_BAR_HEIGHT, 1.5 * width)} fill={color.background.raised} />
              </Svg>
            </Animated.View>
          ) : null}
        </View>
        <View style={styles.row}>
          {items.map((it) => (
            <TabItem key={it.key} item={it} active={it.key === activeKey} onSelect={onSelect} />
          ))}
        </View>
      </View>
      {width > 0 && active ? (
        <Animated.View style={[styles.bubble, shadowStyle(shadow.card), bubbleStyle]} pointerEvents="none">
          <Icon name={active.icon} active size={32} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md, paddingTop: NAV_BUBBLE_RISE },
  shadow: { height: NAV_BAR_HEIGHT, borderRadius: radius.xl },
  clip: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.xl, overflow: 'hidden' },
  shape: { position: 'absolute', top: 0, left: 0, height: NAV_BAR_HEIGHT },
  row: { flex: 1, flexDirection: 'row' },
  item: {
    flex: 1,
    minHeight: NAV_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
    gap: 2,
  },
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
