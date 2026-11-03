import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadowStyle } from '../styles/helpers.ts';
import { usePressBounce } from '../motion/usePressBounce.ts';
import { color, palette, radius, shadow, spacing, spring } from '../tokens.ts';
import { Icon, type NavIconName } from './Icon.tsx';
import { Text } from './Text.tsx';
import { useReduceMotion } from '../motion/MotionProvider.tsx';

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

/** Height of the floating bar incl. its bottom offset – screens add this as bottom inset. */
export const BOTTOM_NAV_HEIGHT = 76 + spacing.lg;

function TabItem({
  item,
  active,
  onSelect,
}: {
  item: BottomNavItem;
  active: boolean;
  onSelect: (key: string) => void;
}) {
  const bounce = usePressBounce();
  const lift = useSharedValue(active ? 1 : 0);
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    lift.set(reduceMotion ? (active ? 1 : 0) : withSpring(active ? 1 : 0, spring.bouncy));
  }, [active, lift, reduceMotion]);
  // the active icon hops up a little – the child sees where it is
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * lift.get() }, { scale: 1 + 0.08 * lift.get() }],
  }));
  return (
    <Animated.View style={bounce.style}>
      <Pressable
        testID={`tab-${item.key}`}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
        onPress={() => onSelect(item.key)}
        {...bounce.handlers}
        style={[styles.item, active ? styles.itemActive : null]}
      >
        <Animated.View style={iconStyle}>
          <Icon name={item.icon} active={active} />
        </Animated.View>
        <Text variant="caption" style={{ color: active ? color.text.primary : color.text.secondary }}>
          {item.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Floating, rounded tab bar with illustrated two-tone icons. */
export function BottomNavigation({ items, activeKey, onSelect }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.xs }]}
      accessibilityRole="tablist"
    >
      <View style={[styles.bar, shadowStyle(shadow.raised)]}>
        {items.map((it) => (
          <TabItem key={it.key} item={it} active={it.key === activeKey} onSelect={onSelect} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md },
  bar: {
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: color.background.raised,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  item: {
    minWidth: 72,
    height: 62,
    borderRadius: radius.lg - 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemActive: { backgroundColor: palette.yellow100 },
});
