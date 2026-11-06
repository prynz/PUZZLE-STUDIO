import { validChoice } from '@puzzle-studio/game-progression';
import {
  Appear,
  BOTTOM_NAV_HEIGHT,
  Icon,
  IconButton,
  Mascot,
  PuzzleCard,
  Screen,
  Text,
  TiltShelf,
  spacing,
  staggerDelay,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { collectionItems, continueItem } from '@/features/collection/collectionView';
import { starsText, t } from '@/i18n';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

import { HomeJourney } from './HomeJourney';
import { HomeStory } from './HomeStory';

const SHELF_MAX = 6;

/**
 * Start screen as a small story: greeting, swipeable story cards (continue · create · Pino's
 * pictures), Pino's journey through the milestones and a shelf with the latest puzzles.
 */
export function HomeScreen() {
  const router = useRouter();
  const { puzzles } = usePuzzles();
  const { images } = useImages();
  const { unlocked } = useProgress();
  const { settings } = useSettings();
  const all = useMemo(() => collectionItems(puzzles, images, 'all', 'newest'), [puzzles, images]);
  const open = continueItem(all);
  const frame = validChoice(settings.cardFrame, unlocked, 'frame');

  return (
    <Screen scroll decor="sky" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <Appear variant="rise" style={styles.topRow}>
        <View style={styles.greeting}>
          <Text variant="label" tone="brand">
            {t('home.hello')}
          </Text>
          <Text variant="title1">{t('home.question')}</Text>
        </View>
        <IconButton
          testID="open-parents"
          size={48}
          accessibilityLabel={t('home.parents')}
          icon={<Icon name="lock" />}
          onPress={() => router.push('/parents')}
        />
      </Appear>

      <Appear variant="rise" delay={staggerDelay(1)}>
        <HomeStory open={open} />
      </Appear>

      <Appear variant="rise" delay={staggerDelay(2)}>
        <HomeJourney />
      </Appear>

      <Appear variant="rise" delay={staggerDelay(3)} style={styles.block}>
        <Text variant="title2" accessibilityRole="header">
          {t('home.collection.title')}
        </Text>
        {all.length === 0 ? (
          <View style={styles.empty}>
            <Mascot emotion="sleeping" size={72} accessibilityLabel={null} />
            <Text variant="body" tone="secondary" style={styles.emptyText}>
              {t('home.collection.empty')}
            </Text>
          </View>
        ) : (
          <TiltShelf
            testID="home-shelf"
            more={{
              label: t('home.collection.all'),
              onPress: () => router.push('/collection'),
              testID: 'home-collection',
            }}
          >
            {all.slice(0, SHELF_MAX).map((i) => (
              <PuzzleCard
                key={i.puzzle.id}
                testID="home-puzzle"
                thumbUri={i.image.thumbUri}
                aspect={1}
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
            ))}
          </TiltShelf>
        )}
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  greeting: { flex: 1 },
  block: { gap: spacing.xs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyText: { flex: 1 },
});
