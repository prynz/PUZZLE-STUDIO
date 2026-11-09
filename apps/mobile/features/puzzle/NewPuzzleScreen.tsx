import { ENGINE_VERSION, PIECE_PRESETS, chooseGrid, type PieceShapeStyle } from '@puzzle-studio/puzzle-engine';
import {
  Appear,
  Chip,
  Section,
  layout,
  staggerDelay,
  EmptyState,
  ImageTile,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';
import { useImages } from '@/store/images';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

const DEFAULT_PIECES = { toddler: 4, kid: 9, pro: 16 } as const;

/** Choose piece count and shape for a saved picture – or continue a started puzzle. */
export function NewPuzzleScreen() {
  const router = useRouter();
  const { imageId } = useLocalSearchParams<{ imageId: string }>();
  const { images } = useImages();
  const { puzzles, create, reset } = usePuzzles();
  const { settings } = useSettings();
  const image = images.find((i) => i.id === imageId);
  const profile = settings.profile;

  const options = useMemo(() => {
    if (!image) return [];
    const aspect = image.work.width / image.work.height;
    const seen = new Set<number>();
    return PIECE_PRESETS.map((n) => chooseGrid(n, aspect)).filter((g) => {
      const n = g.rows * g.cols;
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });
  }, [image]);
  const [pick, setPick] = useState<number | null>(null);
  const [shape, setShape] = useState<PieceShapeStyle>('classic');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!image) {
    return (
      <Screen background="dream">
        <EmptyState
          title={t('newPuzzle.missing')}
          message={t('creator.next')}
          action={<SecondaryButton label={t('newPuzzle.back')} onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const wanted = DEFAULT_PIECES[profile];
  const fallback = options.reduce((best, g) =>
    Math.abs(g.rows * g.cols - wanted) < Math.abs(best.rows * best.cols - wanted) ? g : best,
  );
  const grid = options.find((g) => g.rows * g.cols === pick) ?? fallback;
  const started = puzzles.filter((p) => p.imageId === image.id);

  const start = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const p = await create({
        imageId: image.id,
        profile,
        definition: {
          engineVersion: ENGINE_VERSION,
          seed: Math.floor(Math.random() * 0x7fffffff),
          rows: grid.rows,
          cols: grid.cols,
          shape,
          width: image.work.width,
          height: image.work.height,
        },
      });
      router.replace({ pathname: '/puzzle/[id]', params: { id: p.id } });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      background="dream"
      contentStyle={styles.content}
      footer={<PrimaryButton testID="puzzle-start" label={t('newPuzzle.start')} onPress={start} disabled={busy} />}
    >
      <View style={styles.header}>
        <SecondaryButton size="compact" label={t('newPuzzle.back')} onPress={() => router.back()} />
        <Text variant="title2" accessibilityRole="header">
          {t('newPuzzle.title')}
        </Text>
      </View>
      <Appear variant="rise">
        <Section tone="sky">
          <View style={styles.top}>
            <View style={styles.preview}>
              <ImageTile
                source={{ uri: image.thumbUri }}
                aspect={image.work.width / image.work.height}
                accessibilityLabel={t('creator.imageLabel')}
              />
            </View>
            <View style={styles.started}>
              {started.length > 0 ? <Text variant="label">{t('newPuzzle.started')}</Text> : null}
              {started.map((p) => {
                const total = p.definition.rows * p.definition.cols;
                const done = p.status === 'completed';
                return (
                  <SecondaryButton
                    key={p.id}
                    size="compact"
                    testID="puzzle-continue"
                    label={
                      done ? t('newPuzzle.again', { total }) : t('newPuzzle.continue', { placed: p.placedCount, total })
                    }
                    onPress={async () => {
                      if (done) await reset(p.id);
                      router.replace({ pathname: '/puzzle/[id]', params: { id: p.id } });
                    }}
                  />
                );
              })}
              <Text variant="label">{t('newPuzzle.shape')}</Text>
              <View style={styles.chips}>
                {(['classic', 'square'] as const).map((s) => (
                  <Chip
                    key={s}
                    testID={`shape-${s}`}
                    label={t(`newPuzzle.${s}`)}
                    selected={shape === s}
                    onPress={() => setShape(s)}
                  />
                ))}
              </View>
              <Text variant="caption">
                {t('newPuzzle.helper', { name: t(`profile.${profile}.title` as MessageKey) })}
              </Text>
            </View>
          </View>
        </Section>
      </Appear>

      <Appear variant="rise" delay={staggerDelay(1)}>
        <Section title={t('newPuzzle.pieces')}>
          <View style={styles.chips}>
            {options.map((g) => {
              const n = g.rows * g.cols;
              return (
                <Chip
                  key={n}
                  testID={`pieces-${n}`}
                  label={t('newPuzzle.count', { n })}
                  selected={grid.rows * grid.cols === n}
                  onPress={() => setPick(n)}
                />
              );
            })}
          </View>
        </Section>
      </Appear>

      {failed ? (
        <Surface tone="peach" accessibilityLiveRegion="polite">
          <Text variant="body">{t('newPuzzle.failed')}</Text>
        </Surface>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  preview: { width: '42%' },
  started: { flex: 1, gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
