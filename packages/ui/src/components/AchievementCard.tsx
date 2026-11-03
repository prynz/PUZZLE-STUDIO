import { StyleSheet, View } from 'react-native';

import { shadowStyle } from '../styles/helpers.ts';
import { color, palette, radius, shadow, spacing } from '../tokens.ts';
import { RewardBadge } from './RewardBadge.tsx';
import { Text } from './Text.tsx';

export interface AchievementCardProps {
  title: string;
  /** How to reach it (shown while locked) or what it gave (when unlocked). */
  description: string;
  rewardId: string;
  unlocked: boolean;
  testID?: string;
}

/** One friendly milestone. Locked ones are calm and grey – never a "missing" warning. */
export function AchievementCard({ title, description, rewardId, unlocked, testID }: AchievementCardProps) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled: !unlocked }}
      style={[styles.card, unlocked ? styles.on : styles.off, shadowStyle(shadow.card)]}
    >
      <View style={unlocked ? null : styles.dim}>
        <RewardBadge id={rewardId} size={56} />
      </View>
      <View style={styles.text}>
        <Text variant="label">{title}</Text>
        <Text variant="caption" tone="secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  on: { backgroundColor: color.background.raised, borderColor: palette.yellow600 },
  off: { backgroundColor: palette.cream200, borderColor: color.border.card },
  dim: { opacity: 0.35 },
  text: { flex: 1, gap: 2 },
});
