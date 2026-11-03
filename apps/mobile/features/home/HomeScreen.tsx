import {
  BOTTOM_NAV_HEIGHT,
  FeatureCard,
  Icon,
  IconButton,
  Mascot,
  PuzzleCard,
  Screen,
  SecondaryButton,
  SpeechBubble,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { validChoice } from '@puzzle-studio/game-progression';
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
 * Home: greeting, main action and the latest puzzles (unfinished first → continue with one tap).
 */
export function HomeScreen() {
  const router = useRouter();
  const { puzzles } = usePuzzles();
  const { images } = useImages();
  const { unlocked } = useProgress();
  const { settings } = useSettings();
  // unfinished first (to continue), then the latest finished ones – at most 4
  const recent = useMemo(() => {
    const all = collectionItems(puzzles, images, 'all', 'newest');
    return [...all.filter((i) => !i.done), ...all.filter((i) => i.done)].slice(0, 4);
  }, [puzzles, images]);
  const frame = validChoice(settings.cardFrame, unlocked, 'frame');
  return (
    <Screen scroll decor="sky" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <View />
        <IconButton
          testID="open-parents"
          size={48}
          accessibilityLabel={t('home.parents')}
          icon={<Icon name="lock" />}
          onPress={() => router.push('/parents')}
        />
      </View>

      <View style={styles.greeting}>
        <Mascot emotion="happy" size={112} animated />
        <SpeechBubble>
          <Text variant="title3">{t('home.hello')}</Text>
          <Text variant="body">{t('home.question')}</Text>
        </SpeechBubble>
      </View>

      <FeatureCard
        testID="home-create"
        title={t('home.create.title')}
        subtitle={t('home.create.sub')}
        illustration={<Icon name="gallery" size={96} />}
        onPress={() => router.push('/create')}
      />

      <Text variant="title3" accessibilityRole="header" style={styles.section}>
        {t('home.collection.title')}
      </Text>
      {recent.length === 0 ? (
        <Surface tone="pink" style={styles.empty}>
          <Mascot emotion="sleeping" size={72} accessibilityLabel={null} />
          <Text variant="body" style={styles.emptyText}>
            {t('home.collection.empty')}
          </Text>
        </Surface>
      ) : (
        <>
          <View style={styles.grid}>
            {recent.map((i) => (
              <View key={i.puzzle.id} style={styles.cell}>
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
              </View>
            ))}
          </View>
          <SecondaryButton
            testID="home-collection"
            label={t('home.collection.all')}
            onPress={() => router.push('/collection')}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { marginTop: spacing.xs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyText: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
});
