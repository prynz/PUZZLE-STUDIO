import { generatePuzzle } from '@puzzle-studio/puzzle-engine';
import {
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Mascot,
  Screen,
  SecondaryButton,
  SpeechBubble,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useImages } from '@/store/images';
import { usePuzzles } from '@/store/puzzles';
import type { SaveProgress, StoredPuzzle } from '@/storage/puzzles/types';
import type { StoredImage } from '@/storage/images/types';

import { BasketRow } from './BasketRow';
import { Celebration } from './Celebration';
import { PlayBoard } from './PlayBoard';
import { PlayHeader } from './PlayHeader';
import { useGame } from './game/useGame';

/** Route `/puzzle/[id]`: finds puzzle + picture, then hands over to the game. */
export function PlayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { puzzles, ready } = usePuzzles();
  const { images } = useImages();
  const stored = puzzles.find((p) => p.id === id);
  const image = stored ? images.find((i) => i.id === stored.imageId) : undefined;
  if (!ready) return <LoadingState message={t('play.loading')} />;
  if (!stored || !image) {
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
  return <Game key={stored.id} stored={stored} image={image} />;
}

function Game({ stored, image }: { stored: StoredPuzzle; image: StoredImage }) {
  const router = useRouter();
  const { save, reset } = usePuzzles();
  // geometry is regenerated from the stored definition – never stored itself
  const puzzle = useMemo(() => generatePuzzle(stored.definition), [stored.definition]);
  const persist = useCallback((p: SaveProgress) => save(stored.id, p), [save, stored.id]);
  const game = useGame(stored, puzzle, persist);
  const [zoom, setZoom] = useState(0);
  const [ready, setReady] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [cheer, setCheer] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // a finished toddler bite gets a short cheer from Pino
  const biteId = game.bite?.id ?? null;
  const [lastBite, setLastBite] = useState(biteId);
  if (biteId !== lastBite) {
    setLastBite(biteId);
    if (lastBite !== null && biteId !== null) setCheer(true);
  }
  useEffect(() => {
    if (!cheer) return;
    const timer = setTimeout(() => setCheer(false), 1800);
    return () => clearTimeout(timer);
  }, [cheer]);

  const restart = () => {
    setConfirmRestart(false);
    game.restart();
    reset(stored.id).catch(() => undefined); // the next move saves again anyway
  };

  return (
    <Screen background="table" contentStyle={styles.content}>
      <PlayHeader
        game={game}
        total={puzzle.pieces.length}
        onBack={() => router.back()}
        onRestart={() => setConfirmRestart(true)}
      />
      {game.restoreFailed ? (
        <Surface tone="peach" style={styles.notice}>
          <Text variant="body">{t('play.restoreFailed')}</Text>
        </Surface>
      ) : null}
      <PlayBoard
        puzzle={puzzle}
        imageUri={image.work.uri}
        game={game}
        zoom={zoom}
        setZoom={setZoom}
        onReady={onReady}
        overlay={
          game.hint !== null || cheer ? (
            <View style={styles.pino}>
              <Mascot emotion={cheer ? 'excited' : 'happy'} size={64} accessibilityLabel={null} />
              <SpeechBubble>
                <Text variant="label" accessibilityLiveRegion="polite">
                  {cheer ? t('play.biteDone') : t('play.hintSay')}
                </Text>
              </SpeechBubble>
            </View>
          ) : null
        }
      />
      {!ready ? (
        <View style={styles.loading} pointerEvents="none">
          <LoadingState message={t('play.loading')} />
        </View>
      ) : null}
      {game.bites ? null : <BasketRow puzzle={puzzle} game={game} />}
      <ConfirmDialog
        visible={confirmRestart}
        title={t('play.restartTitle')}
        message={t('play.restartBody')}
        confirmLabel={t('play.restartYes')}
        cancelLabel={t('play.restartNo')}
        onConfirm={restart}
        onCancel={() => setConfirmRestart(false)}
      />
      <Celebration
        visible={game.complete}
        total={puzzle.pieces.length}
        onAgain={restart}
        onAtelier={() => router.dismissTo('/create')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: spacing.xs, paddingBottom: spacing.md, paddingHorizontal: 0 },
  notice: { marginHorizontal: spacing.md },
  pino: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md },
  loading: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center' },
});
