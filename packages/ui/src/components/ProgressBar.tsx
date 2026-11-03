import { StyleSheet, View } from 'react-native';

import { palette, radius } from '../tokens.ts';

export interface ProgressBarProps {
  /** 0 … 1 */
  value: number;
  /** Spoken, e.g. "3 von 9 Häppchen fertig". */
  accessibilityLabel: string;
}

/** Slim, rounded progress bar without numbers (toddlers can't read). */
export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
    >
      <View style={[styles.fill, { width: `${v * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: radius.pill, backgroundColor: palette.lavender100, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.mint600 },
});
