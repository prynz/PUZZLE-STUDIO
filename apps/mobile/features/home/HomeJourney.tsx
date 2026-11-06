import { ACHIEVEMENTS, nextMilestoneIndex } from '@puzzle-studio/game-progression';
import { JourneyTrail, RewardBadge, Text, palette, radius, spacing, withAlpha } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';
import { useProgress } from '@/store/progress';

/**
 * "Pinos Reise": the milestones as stations on a path – the story that runs through playing.
 * Pino waits at the next goal; every finished puzzle moves him on (rewards shown on the way).
 */
export function HomeJourney() {
  const router = useRouter();
  const { unlocked } = useProgress();
  const current = nextMilestoneIndex(unlocked);
  const total = ACHIEVEMENTS.length;
  const next = ACHIEVEMENTS[current];
  const name = (id: string) => t(`ach.${id}` as MessageKey);
  const stations = ACHIEVEMENTS.map((a, i) => {
    const done = unlocked.has(a.id);
    const state = done ? 'stationDone' : i === current ? 'stationNext' : 'stationLater';
    return {
      id: a.id,
      label: name(a.id),
      done,
      badge: <RewardBadge id={a.reward.id} size={44} />,
      accessibilityLabel: t(`home.journey.${state}`, { name: name(a.id) }),
    };
  });

  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <Text variant="title2" accessibilityRole="header">
          {t('home.journey.title')}
        </Text>
        <View style={styles.chapter}>
          <Text variant="caption" tone="brand" testID="home-chapter">
            {t('home.journey.chapter', { n: Math.min(current + 1, total), total })}
          </Text>
        </View>
      </View>
      <Text variant="body" tone="secondary">
        {next ? t('home.journey.next', { how: t(`ach.${next.id}.how` as MessageKey) }) : t('home.journey.done')}
      </Text>
      <JourneyTrail
        testID="home-journey"
        stations={stations}
        current={current}
        onPressStation={() => router.push('/awards')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.xxs },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  chapter: {
    backgroundColor: withAlpha(palette.white, 0.8),
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
