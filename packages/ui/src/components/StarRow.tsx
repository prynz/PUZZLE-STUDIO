import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { starIcon } from '../illustrations/rewards.ts';
import { Appear } from './Appear.tsx';

export interface StarRowProps {
  stars: number;
  max?: number;
  size?: number;
  accessibilityLabel?: string;
  /** Earned stars pop in one after another (celebration). Static with Reduced Motion. */
  animated?: boolean;
  /** ms before the first star pops. */
  delay?: number;
}

/** 1–3 stars for a finished puzzle (bigger puzzles shine more – never speed). */
export function StarRow({ stars, max = 3, size = 22, accessibilityLabel, animated = false, delay = 0 }: StarRowProps) {
  return (
    <View style={styles.row} accessible={accessibilityLabel !== undefined} accessibilityLabel={accessibilityLabel}>
      {Array.from({ length: max }, (_, i) => {
        const star = <SvgXml xml={starIcon(i < stars, size)} width={size} height={size} />;
        return animated && i < stars ? (
          <Appear key={i} variant="pop" delay={delay + i * 260}>
            {star}
          </Appear>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
