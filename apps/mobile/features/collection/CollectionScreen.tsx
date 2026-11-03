import { validChoice } from '@puzzle-studio/game-progression';
import {
  Appear,
  BOTTOM_NAV_HEIGHT,
  Section,
  layout,
  staggerDelay,
  Chip,
  EmptyState,
  PrimaryButton,
  PuzzleCard,
  Screen,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { starsText, t } from '@/i18n';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

import { collectionItems, type CollectionFilter, type CollectionItem, type CollectionSort } from './collectionView';
import { PuzzleSheet } from './PuzzleSheet';

const FILTERS: CollectionFilter[] = ['all', 'started', 'done'];
const SORTS: CollectionSort[] = ['newest', 'biggest'];

/** Tab "Sammlung": every puzzle with progress or stars – filter, sort, continue, play again, delete. */
export function CollectionScreen() {
  const router = useRouter();
  const { puzzles } = usePuzzles();
  const { images } = useImages();
  const { unlocked } = useProgress();
  const { settings } = useSettings();
  const [filter, setFilter] = useState<CollectionFilter>('all');
  const [sort, setSort] = useState<CollectionSort>('newest');
  const [open, setOpen] = useState<CollectionItem | null>(null);
  const items = useMemo(() => collectionItems(puzzles, images, filter, sort), [puzzles, images, filter, sort]);
  const hasAny = puzzles.length > 0;
  const frame = validChoice(settings.cardFrame, unlocked, 'frame');

  if (!hasAny) {
    return (
      <Screen decor="sky" bottomInset={BOTTOM_NAV_HEIGHT}>
        <EmptyState
          testID="collection-empty"
          emotion="sleeping"
          title={t('collection.emptyTitle')}
          message={t('collection.emptyBody')}
          action={<PrimaryButton label={t('collection.toAtelier')} onPress={() => router.push('/create')} />}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll decor="sky" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <Text variant="title1" accessibilityRole="header">
        {t('collection.title')}
      </Text>
      <Section tone="lavender">
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              testID={`filter-${f}`}
              label={t(`collection.${f}`)}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {SORTS.map((s) => (
            <Chip
              key={s}
              testID={`sort-${s}`}
              label={t(`collection.${s}`)}
              selected={sort === s}
              onPress={() => setSort(s)}
            />
          ))}
        </View>
      </Section>
      {items.length === 0 ? (
        <Surface tone="pink">
          <Text variant="body">{t('collection.filterEmpty')}</Text>
        </Surface>
      ) : (
        <View style={styles.grid}>
          {items.map((i, index) => (
            <Appear
              key={`${filter}-${sort}-${i.puzzle.id}`}
              variant="pop"
              delay={staggerDelay(index)}
              style={styles.cell}
            >
              <PuzzleCard
                testID="collection-card"
                thumbUri={i.image.thumbUri}
                aspect={i.image.work.width / i.image.work.height}
                title={t('collection.card', { n: i.pieces })}
                progress={i.progress}
                stars={i.stars}
                frameId={frame}
                accessibilityLabel={
                  i.done
                    ? t('collection.cardDone', { n: i.pieces, stars: starsText(i.stars ?? 0) })
                    : t('collection.cardProgress', { n: i.pieces, placed: i.puzzle.placedCount })
                }
                onPress={() => setOpen(i)}
              />
            </Appear>
          ))}
        </View>
      )}
      <PuzzleSheet item={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
});
