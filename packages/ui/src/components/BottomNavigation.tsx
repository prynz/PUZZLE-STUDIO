import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadowStyle } from '../styles/helpers.ts';
import { color, palette, radius, shadow, spacing } from '../tokens.ts';
import { Icon, type NavIconName } from './Icon.tsx';
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

/** Height of the floating bar incl. its bottom offset – screens add this as bottom inset. */
export const BOTTOM_NAV_HEIGHT = 76 + spacing.lg;

/** Floating, rounded tab bar with illustrated two-tone icons. */
export function BottomNavigation({ items, activeKey, onSelect }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.xs }]}
      accessibilityRole="tablist"
    >
      <View style={[styles.bar, shadowStyle(shadow.raised)]}>
        {items.map((it) => {
          const active = it.key === activeKey;
          return (
            <Pressable
              key={it.key}
              testID={`tab-${it.key}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={it.label}
              onPress={() => onSelect(it.key)}
              style={[styles.item, active ? styles.itemActive : null]}
            >
              <Icon name={it.icon} active={active} />
              <Text variant="caption" style={{ color: active ? color.text.primary : color.text.secondary }}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
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
