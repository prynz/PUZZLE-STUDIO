import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { starIcon } from '../illustrations/rewards.ts';

/** 1–3 stars for a finished puzzle (bigger puzzles shine more – never speed). */
export function StarRow({
  stars,
  max = 3,
  size = 22,
  accessibilityLabel,
}: {
  stars: number;
  max?: number;
  size?: number;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.row} accessible={accessibilityLabel !== undefined} accessibilityLabel={accessibilityLabel}>
      {Array.from({ length: max }, (_, i) => (
        <SvgXml key={i} xml={starIcon(i < stars, size)} width={size} height={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
