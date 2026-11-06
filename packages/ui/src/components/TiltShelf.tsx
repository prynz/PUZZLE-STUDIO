import { Children, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressBounce } from '../motion/usePressBounce.ts';
import { withAlpha } from '../styles/helpers.ts';
import { palette, radius, spacing } from '../tokens.ts';
import { Icon } from './Icon.tsx';
import { Text } from './Text.tsx';

export interface TiltShelfProps {
  children: ReactNode;
  /** Width of one item. */
  itemWidth?: number;
  /** Closing tile ("Alle ansehen"). */
  more?: { label: string; onPress: () => void; testID?: string };
  testID?: string;
}

const TILT = [-3, 2, -1.5, 3, -2.5, 1.5];

/**
 * Sideways shelf for finished pictures: cards lean slightly like photos pinned to a board.
 * Swipe to see more; the last tile leads to the full collection.
 */
export function TiltShelf({ children, itemWidth = 152, more, testID }: TiltShelfProps) {
  const items = Children.toArray(children);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.row}
      testID={testID}
    >
      {items.map((item, i) => (
        <View key={i} style={{ width: itemWidth, transform: [{ rotate: `${TILT[i % TILT.length] ?? 0}deg` }] }}>
          {item}
        </View>
      ))}
      {more ? <MoreTile {...more} width={itemWidth * 0.75} /> : null}
    </ScrollView>
  );
}

function MoreTile({
  label,
  onPress,
  testID,
  width,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  width: number;
}) {
  const bounce = usePressBounce();
  return (
    <Animated.View style={[bounce.style, styles.moreBox]}>
      <Pressable
        {...bounce.handlers}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={[styles.more, { width }]}
      >
        <View style={styles.moreIcon}>
          <Icon name="forward" size={22} />
        </View>
        <Text variant="label" align="center">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -spacing.xl },
  row: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.md, alignItems: 'stretch' },
  moreBox: { alignSelf: 'stretch' },
  more: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: palette.leaf600,
    backgroundColor: withAlpha(palette.white, 0.6),
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  moreIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
