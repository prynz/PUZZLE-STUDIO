import { validChoice } from '@puzzle-studio/game-progression';
import { generatePuzzle } from '@puzzle-studio/puzzle-engine';
import {
  BACKGROUND_LOOKS,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Screen,
  SecondaryButton,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';
import type { SaveProgress, StoredPuzzle } from '@/storage/puzzles/types';
import type { StoredImage } from '@/storage/images/types';

import { BasketRow } from './BasketRow';
import { Celebration } from './Celebration';
import { useCompletion } from './useCompletion';
import { PlayBoard } from './PlayBoard';
import { PlayHeader } from './PlayHeader';
import { PinoBubble } from './PinoBubble';
import { useHintOffer } from './useHintOffer';
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
  const { settings } = useSettings();
  const game = useGame(stored, puzzle, persist, settings.parent);
  const completion = useCompletion(stored, image, game.complete);
  const { unlocked } = useProgress();
  const background = validChoice(settings.boardBackground, unlocked, 'background');
  const decor = background ? BACKGROUND_LOOKS[background] : undefined;
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

  // after a while without progress Pino offers a hint – only an offer, the child decides
  const offer = useHintOffer(
    game.placed,
    game.rules.hintOfferAfterSec,
    settings.parent.hintOffers,
    !ready || game.complete || game.hint !== null || cheer || confirmRestart,
  );
  const says = cheer ? 'cheer' : game.hint !== null ? 'hint' : offer.offered ? 'offer' : null;

  const restart = () => {
    setConfirmRestart(false);
    completion.clear();
    game.restart();
    reset(stored.id).catch(() => undefined); // the next move saves again anyway
  };

  return (
    <Screen background="table" gutter={false} contentStyle={styles.content} {...(decor ? { decor } : {})}>
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
          says ? (
            <PinoBubble
              says={says}
              onAccept={() => {
                offer.dismiss();
                game.showHint();
              }}
              onDismiss={offer.dismiss}
            />
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
        result={completion.result}
        onAgain={restart}
        onAtelier={() => router.dismissTo('/create')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: spacing.xs, paddingBottom: spacing.md },
  notice: { marginHorizontal: spacing.md },
  loading: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center' },
});
