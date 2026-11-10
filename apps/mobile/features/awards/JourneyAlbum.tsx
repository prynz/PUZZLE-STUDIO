import { WORLDS } from '@puzzle-studio/game-progression';
import { Appear, Icon, Section, StoryPicture, Text, palette, radius, spacing, staggerDelay } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { journeyPicture } from '@/features/journey/pictures';
import { t, type MessageKey } from '@/i18n';
import { useJourney } from '@/store/journey';

const STICKER = 92;

/**
 * Sticker album (concept 2 §3): every finished journey station puts its picture into the album,
 * slightly tilted like a real sticker. Open places show a soft placeholder with a lock.
 */
export function JourneyAlbum() {
  const { done } = useJourney();
  return (
    <>
      {WORLDS.map((world, w) => {
        const got = world.stations.filter((s) => done.has(s.id)).length;
        return (
          <Section
            key={world.id}
            tone="mint"
            title={t(`world.${world.id}` as MessageKey)}
            aside={
              <Text variant="caption" tone="brand" testID={`album-count-${world.id}`}>
                {t('awards.albumCount', { n: got, total: world.stations.length })}
              </Text>
            }
          >
            <View style={styles.grid}>
              {world.stations.map((s, i) => {
                const picture = journeyPicture(s.picture);
                const name = picture ? t(picture.labelKey) : '';
                const have = done.has(s.id) && picture;
                return (
                  <Appear key={s.id} variant="pop" delay={staggerDelay(w * 6 + i, 70)} style={styles.cell}>
                    <View
                      testID={have ? `album-sticker-${s.id}` : `album-open-${s.id}`}
                      accessible
                      accessibilityLabel={have ? name : t('awards.albumOpen')}
                      style={styles.place}
                    >
                      {have ? (
                        <StoryPicture source={picture.module} size={STICKER} tilt={i % 2 === 0 ? -5 : 4} />
                      ) : (
                        <View style={styles.empty}>
                          <Icon name="lock" size={20} />
                        </View>
                      )}
                    </View>
                  </Appear>
                );
              })}
            </View>
          </Section>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  cell: { width: '31%' },
  place: { alignItems: 'center', justifyContent: 'center', minHeight: STICKER + 16 },
  empty: {
    width: STICKER,
    height: STICKER,
    borderRadius: radius.md,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: palette.mist300,
    backgroundColor: palette.mist200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
