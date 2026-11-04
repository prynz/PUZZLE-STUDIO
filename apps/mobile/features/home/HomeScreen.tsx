import { validChoice } from '@puzzle-studio/game-progression';
import {
  Appear,
  BOTTOM_NAV_HEIGHT,
  FeatureCard,
  Icon,
  IconButton,
  Mascot,
  PuzzleCard,
  Screen,
  SecondaryButton,
  Section,
  SpeechBubble,
  Text,
  layout,
  spacing,
  staggerDelay,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { collectionItems } from '@/features/collection/collectionView';
import { starsText, t } from '@/i18n';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

/**
 * Home: greeting, the main action and the latest puzzles (unfinished first → continue with
 * one tap). Three clearly separated blocks that fit on one phone screen without scrolling.
 */
export function HomeScreen() {
  const router = useRouter();
  const { puzzles } = usePuzzles();
  const { images } = useImages();
  const { unlocked } = useProgress();
  const { settings } = useSettings();
  // unfinished first (to continue), then the latest finished ones – two fit without scrolling
  const recent = useMemo(() => {
    const all = collectionItems(puzzles, images, 'all', 'newest');
    return [...all.filter((i) => !i.done), ...all.filter((i) => i.done)].slice(0, 2);
  }, [puzzles, images]);
  const frame = validChoice(settings.cardFrame, unlocked, 'frame');

  return (
    <Screen scroll decor="sky" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Appear variant="rise" style={styles.greeting}>
          <Mascot emotion="happy" size={96} animated />
          <SpeechBubble>
            <Text variant="title3">{t('home.hello')}</Text>
            <Text variant="body">{t('home.question')}</Text>
          </SpeechBubble>
        </Appear>
        <IconButton
          testID="open-parents"
          size={48}
          accessibilityLabel={t('home.parents')}
          icon={<Icon name="lock" />}
          onPress={() => router.push('/parents')}
        />
      </View>

      <Appear variant="rise" delay={staggerDelay(1)}>
        <FeatureCard
          testID="home-create"
          title={t('home.create.title')}
          subtitle={t('home.create.sub')}
          illustration={<Icon name="gallery" size={88} />}
          onPress={() => router.push('/create')}
        />
      </Appear>

      <Appear variant="rise" delay={staggerDelay(2)}>
        <Section
          title={t('home.collection.title')}
          tone="leaf"
          aside={
            recent.length > 0 ? (
              <SecondaryButton
                size="compact"
                testID="home-collection"
                label={t('home.collection.all')}
                onPress={() => router.push('/collection')}
              />
            ) : null
          }
        >
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Mascot emotion="sleeping" size={72} accessibilityLabel={null} />
              <Text variant="body" style={styles.emptyText}>
                {t('home.collection.empty')}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {recent.map((i, index) => (
                <Appear key={i.puzzle.id} variant="pop" delay={staggerDelay(3 + index)} style={styles.cell}>
                  <PuzzleCard
                    testID="home-puzzle"
                    thumbUri={i.image.thumbUri}
                    aspect={i.image.work.width / i.image.work.height}
                    title={i.done ? t('collection.card', { n: i.pieces }) : t('home.continue')}
                    progress={i.progress}
                    stars={i.stars}
                    frameId={frame}
                    accessibilityLabel={
                      i.done
                        ? t('collection.cardDone', { n: i.pieces, stars: starsText(i.stars ?? 0) })
                        : `${t('home.continue')}: ${t('collection.cardProgress', { n: i.pieces, placed: i.puzzle.placedCount })}`
                    }
                    onPress={() =>
                      i.done
                        ? router.push('/collection')
                        : router.push({ pathname: '/puzzle/[id]', params: { id: i.puzzle.id } })
                    }
                  />
                </Appear>
              ))}
            </View>
          )}
        </Section>
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  greeting: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyText: { flex: 1 },
  grid: { flexDirection: 'row', gap: spacing.sm },
  cell: { width: '48%' },
});
