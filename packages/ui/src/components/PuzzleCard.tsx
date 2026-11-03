import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { FRAME_LOOKS } from '../illustrations/rewards.ts';
import { usePressBounce } from '../motion/usePressBounce.ts';
import { shadowStyle } from '../styles/helpers.ts';
import { color, palette, radius, shadow, spacing } from '../tokens.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { StarRow } from './StarRow.tsx';
import { Text } from './Text.tsx';

export interface PuzzleCardProps {
  thumbUri: string;
  aspect: number;
  /** e.g. "36 Teile" */
  title: string;
  /** 0 … 1 */
  progress: number;
  /** Stars when finished, null while in progress. */
  stars: number | null;
  /** Reward frame id (finished puzzles only). */
  frameId?: string | null;
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

/** Collection card: picture, size, progress or stars – finished puzzles can wear a reward frame. */
export function PuzzleCard(p: PuzzleCardProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const frame = p.stars !== null && p.frameId ? FRAME_LOOKS[p.frameId] : undefined;
  const bounce = usePressBounce();
  return (
    <Animated.View style={bounce.style}>
      <Pressable
        {...bounce.handlers}
        testID={p.testID}
        accessibilityRole="button"
        accessibilityLabel={p.accessibilityLabel}
        onPress={p.onPress}
        style={[
          styles.card,
          frame ? { borderColor: frame.outer, backgroundColor: frame.inner } : null,
          shadowStyle(shadow.card),
        ]}
      >
        <View style={[styles.picture, { height: width > 0 ? width / p.aspect : undefined }]} onLayout={onLayout}>
          {width > 0 ? <Image source={{ uri: p.thumbUri }} style={{ width, height: width / p.aspect }} /> : null}
        </View>
        <View style={styles.meta}>
          <Text variant="label">{p.title}</Text>
          {p.stars !== null ? <StarRow stars={p.stars} size={18} /> : <ProgressBar value={p.progress} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: color.border.card,
    backgroundColor: color.background.raised,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  picture: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: palette.cream200, minHeight: 40 },
  meta: { gap: spacing.xs, paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
});
