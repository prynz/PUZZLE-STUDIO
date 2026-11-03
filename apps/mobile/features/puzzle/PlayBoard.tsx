import type { Puzzle, Rect } from '@puzzle-studio/puzzle-engine';
import { Burst, Icon, IconButton, Text, spacing, useReduceMotion } from '@puzzle-studio/ui';
import { Suspense, lazy, useCallback, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { t } from '@/i18n';
import { loadSkia } from '@/services/skiaLoader';

import { playLayout, slotRect, type PlayLayout } from './game/layout';
import type { Game } from './game/useGame';
import { ZOOM_LEVELS, clampView, fitView, toScreen, zoomed, type View as ViewT } from './game/viewport';

const PlayCanvas = lazy(async () => {
  await loadSkia();
  const m = await import('./board/PlayCanvas');
  return { default: m.PlayCanvas };
});

/** Faint reference picture under the board – stronger help for younger players. */
const REFERENCE_OPACITY = { toddler: 0.4, kid: 0.25, pro: 0.12 } as const;

export interface PlayBoardProps {
  puzzle: Puzzle;
  imageUri: string;
  game: Game;
  zoom: number;
  setZoom: (z: number) => void;
  onReady: () => void;
  /** Shown on top of the board (Pino's speech bubble) – does not move the board; decides itself what is touchable. */
  overlay?: ReactNode;
}

/** Measures the space, keeps the view (fit / bite / zoom + pan) and hosts the lazy Skia canvas. */
export function PlayBoard({ puzzle, imageUri, game, zoom, setZoom, onReady, overlay }: PlayBoardProps) {
  const reduceMotion = useReduceMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s && Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
  };
  const profile = game.profile;
  const layout: PlayLayout | null = useMemo(
    () => (size ? playLayout(size.w, size.h, profile, game.rules) : null),
    [size, profile, game.rules],
  );

  const boardRect: Rect = useMemo(
    () => ({ x: 0, y: 0, w: puzzle.definition.width, h: puzzle.definition.height }),
    [puzzle],
  );
  const canZoom = !game.bites && game.profile !== 'toddler' && puzzle.pieces.length >= 64;
  // with zoom controls the board keeps a free strip at the bottom for them
  const fitArea = useMemo(
    () => (layout ? (canZoom ? { ...layout.board, h: layout.board.h - 60 } : layout.board) : null),
    [layout, canZoom],
  );
  const base = useMemo(() => (fitArea ? fitView(fitArea, boardRect) : null), [fitArea, boardRect]);
  const playArea = useMemo(() => {
    if (!layout || !base) return boardRect;
    const b = layout.board;
    return { x: (b.x - base.x) / base.scale, y: (b.y - base.y) / base.scale, w: b.w / base.scale, h: b.h / base.scale };
  }, [layout, base, boardRect]);

  // toddler bites: the board zooms to the active bite automatically
  const biteRect = game.bite?.rect ?? null;
  // pan is remembered per zoom level; switching the zoom starts centred again
  const [panState, setPanState] = useState({ zoom, x: 0, y: 0 });
  const pan = panState.zoom === zoom ? panState : { zoom, x: 0, y: 0 };
  const zoomBase = useMemo(() => {
    const z = ZOOM_LEVELS[zoom] ?? 1;
    if (!layout || !base || z === 1) return null;
    return zoomed(base, layout.board, boardRect, z, { x: boardRect.w / 2, y: boardRect.h / 2 });
  }, [layout, base, zoom, boardRect]);
  const view: ViewT | null = useMemo(() => {
    if (!layout || !base) return null;
    if (biteRect) return fitView(layout.board, biteRect, Math.min(puzzle.pieceWidth, puzzle.pieceHeight) * 0.35);
    if (!zoomBase) return base;
    return clampView({ ...zoomBase, x: zoomBase.x + pan.x, y: zoomBase.y + pan.y }, layout.board, boardRect);
  }, [layout, base, biteRect, zoomBase, pan.x, pan.y, boardRect, puzzle]);
  const onPan = useCallback(
    (dx: number, dy: number) => {
      if (!zoomBase || !layout || !view) return;
      // store the clamped result, so panning back responds immediately
      const next = clampView({ ...view, x: view.x + dx, y: view.y + dy }, layout.board, boardRect);
      setPanState({ zoom, x: next.x - zoomBase.x, y: next.y - zoomBase.y });
    },
    [zoomBase, layout, view, boardRect, zoom],
  );

  // toddlers never page: they see as many big pieces as fit next to each other (max. 4)
  const pages =
    layout && game.rules.trayMaxVisible === null ? Math.max(1, Math.ceil(game.source.length / layout.perPage)) : 1;
  const page = Math.min(game.page, pages - 1);
  const trayIds = useMemo(
    () => (layout ? game.source.slice(page * layout.perPage, (page + 1) * layout.perPage) : []),
    [layout, game.source, page],
  );
  const hintCell = game.hint === null ? null : puzzle.pieces[game.hint]?.cell;
  const snapCell = game.snap ? puzzle.pieces[game.snap.id]?.cell : undefined;
  const snapBox =
    view && snapCell
      ? { ...toScreen(view, snapCell.x, snapCell.y), w: snapCell.w * view.scale, h: snapCell.h * view.scale }
      : null;
  const hintBox =
    view && hintCell
      ? { ...toScreen(view, hintCell.x, hintCell.y), w: hintCell.w * view.scale, h: hintCell.h * view.scale }
      : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.area} onLayout={onLayout}>
        {layout && view ? (
          <Suspense fallback={null}>
            <PlayCanvas
              puzzle={puzzle}
              imageUri={imageUri}
              game={game}
              layout={layout}
              view={view}
              playArea={playArea}
              trayIds={trayIds}
              refOpacity={REFERENCE_OPACITY[profile]}
              reduceMotion={reduceMotion}
              onPan={onPan}
              onReady={onReady}
              accessibilityLabel={t('play.board', { total: puzzle.pieces.length })}
            />
            {/* Position markers for UI tests and screen readers – touches pass through to the canvas. */}
            {trayIds.map((id, i) => {
              const r = slotRect(layout, i);
              return (
                <View
                  key={id}
                  testID={`tray-slot-${i}`}
                  pointerEvents="none"
                  accessible
                  accessibilityLabel={t('play.slot', { n: i + 1 })}
                  style={[styles.marker, { left: r.x, top: r.y, width: r.w, height: r.h }]}
                />
              );
            })}
            {snapBox && game.snap ? (
              <Burst
                seq={game.snap.seq}
                x={snapBox.x + snapBox.w / 2}
                y={snapBox.y + snapBox.h / 2}
                size={Math.min(snapBox.w, snapBox.h)}
              />
            ) : null}
            {hintBox ? (
              <View
                testID="hint-target"
                pointerEvents="none"
                accessible
                accessibilityLabel={t('play.hintTarget')}
                style={[styles.marker, { left: hintBox.x, top: hintBox.y, width: hintBox.w, height: hintBox.h }]}
              />
            ) : null}
            {game.source.length === 0 && !game.complete && game.rules.baskets.length > 0 ? (
              <View pointerEvents="none" style={[styles.empty, { top: layout.tray.y, height: layout.tray.h }]}>
                <Text variant="body">{t('play.trayEmpty')}</Text>
              </View>
            ) : null}
            {canZoom ? (
              <View style={[styles.zoom, { top: layout.board.y + layout.board.h - 52 }]}>
                <IconButton
                  testID="zoom-out"
                  accessibilityLabel={t('play.zoomOut')}
                  icon={<Icon name="minus" />}
                  onPress={() => setZoom(Math.max(0, zoom - 1))}
                />
                <IconButton
                  testID="zoom-in"
                  accessibilityLabel={t('play.zoomIn')}
                  icon={<Icon name="plus" />}
                  onPress={() => setZoom(Math.min(ZOOM_LEVELS.length - 1, zoom + 1))}
                />
              </View>
            ) : null}
          </Suspense>
        ) : null}
        {overlay ? (
          <View style={styles.overlay} pointerEvents="box-none">
            {overlay}
          </View>
        ) : null}
      </View>
      {pages > 1 ? (
        <View style={styles.pager}>
          <IconButton
            testID="tray-prev"
            accessibilityLabel={t('play.prev')}
            icon={<Icon name="back" />}
            onPress={() => game.setPage(Math.max(0, page - 1))}
          />
          <Text variant="label">
            {page + 1} / {pages}
          </Text>
          <IconButton
            testID="tray-next"
            accessibilityLabel={t('play.next')}
            icon={<Icon name="forward" />}
            onPress={() => game.setPage(Math.min(pages - 1, page + 1))}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  area: { flex: 1 },
  marker: { position: 'absolute' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0 },
  zoom: { position: 'absolute', right: spacing.md, flexDirection: 'row', gap: spacing.sm },
  empty: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
