import { isPlayable } from '@puzzle-studio/game-progression';
import { JourneyTrail, Text, palette, radius, spacing, withAlpha } from '@puzzle-studio/ui';
import { Image, StyleSheet, View } from 'react-native';

import { journeyPicture } from '@/features/journey/pictures';
import { t, type MessageKey } from '@/i18n';
import { useJourney } from '@/store/journey';

const BADGE = 52;

/**
 * "Pinos Reise" – the heart of the app (concept 2 §3): the stations of the current world on a
 * path. Pino waits at the next station; finished stations show their picture and can be played
 * again, later ones wait with a lock.
 */
export function HomeJourney({ onPlay }: { onPlay: (stationId: string) => void }) {
  const { done, position } = useJourney();
  const { world, worldIndex, stationIndex, next } = position;
  const name = (picture: string) => {
    const p = journeyPicture(picture);
    return p ? t(p.labelKey) : '';
  };
  const stations = world.stations.map((s, i) => {
    const isDone = done.has(s.id);
    const state = isDone ? 'stationDone' : i === stationIndex ? 'stationNext' : 'stationLater';
    const picture = journeyPicture(s.picture);
    return {
      id: s.id,
      label: name(s.picture),
      done: isDone,
      badge: picture ? <Image source={picture.module} style={styles.badge} accessible={false} /> : null,
      accessibilityLabel: t(`home.journey.${state}`, { name: name(s.picture) }),
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
            {t('home.journey.world', {
              world: t(`world.${world.id}` as MessageKey),
              n: Math.min(stationIndex + 1, world.stations.length),
              total: world.stations.length,
            })}
          </Text>
        </View>
      </View>
      <Text variant="body" tone="secondary">
        {next
          ? t('home.journey.nextStation', { name: name(next.picture), pieces: next.pieces })
          : t('home.journey.allDone')}
      </Text>
      <JourneyTrail
        key={`${worldIndex}`}
        testID="home-journey"
        stations={stations}
        current={stationIndex}
        onPressStation={(id) => {
          if (isPlayable(id, done)) onPlay(id);
        }}
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
  badge: { width: BADGE, height: BADGE, borderRadius: BADGE / 2 },
});
