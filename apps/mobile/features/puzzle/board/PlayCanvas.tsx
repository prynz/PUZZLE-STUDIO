import { pieceColorGroups } from '@puzzle-studio/image-processing';
import { hitShapesFor, toSvgPath, type Puzzle, type Rect } from '@puzzle-studio/puzzle-engine';
import { palette, withAlpha } from '@puzzle-studio/ui';
import { Canvas, Group, Image as SkiaImage, Path, Picture, Skia, useImage } from '@shopify/react-native-skia';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { Game } from '../game/useGame';
import { boardBand, type PlayLayout } from '../game/layout';
import type { View } from '../game/viewport';
import { recordScene } from './drawPieces';
import { usePlayGestures } from './usePlayGestures';
import { sampleCellColors } from './sampleColors';

export interface PlayCanvasProps {
  puzzle: Puzzle;
  imageUri: string;
  game: Game;
  layout: PlayLayout;
  view: View;
  /** Play area in image space (where loose pieces may lie). */
  playArea: Rect;
  trayIds: readonly number[];
  refOpacity: number;
  reduceMotion: boolean;
  /** Pans the board (only when zoomed in). */
  onPan: (dx: number, dy: number) => void;
  /** Tells the screen that the board image is ready (loading state ends). */
  onReady: () => void;
  accessibilityLabel: string;
}

/** Flash starts when the piece has glided in (see usePlayGestures SNAP_MS). */
const SNAP_FLASH_DELAY = 160;

/** The play surface: one Skia canvas with board, tray and the live dragged piece. Loaded lazily. */
export function PlayCanvas(props: PlayCanvasProps) {
  const { puzzle, game, layout, view, playArea, trayIds, reduceMotion } = props;
  const image = useImage(props.imageUri);
  const { state } = game;

  const paths = useMemo(
    () => puzzle.pieces.map((p) => Skia.Path.MakeFromSVGString(toSvgPath(p.path)) ?? Skia.Path.Make()),
    [puzzle],
  );
  const shapes = useMemo(() => hitShapesFor(puzzle), [puzzle]);

  // ---- colour groups for the baskets (once per puzzle) ---------------------------------
  const { setGroups } = game;
  const needColors = game.rules.baskets.includes('colors');
  useEffect(() => {
    if (!image || !needColors) return;
    const colors = sampleCellColors(image, puzzle.definition.rows, puzzle.definition.cols);
    if (!colors) return;
    setGroups(
      pieceColorGroups(
        colors.map((rgb, id) => ({ rgb, y: ((puzzle.pieces[id]?.row ?? 0) + 0.5) / puzzle.definition.rows })),
      ),
    );
  }, [image, needColors, puzzle, setGroups]);

  const { onReady } = props;
  useEffect(() => {
    if (image) onReady();
  }, [image, onReady]);

  // ---- live drag state -------------------------------------------------------------------
  const [dragging, setDragging] = useState<number | null>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const dragTilt = useSharedValue(0);

  // ---- short bright flash on a piece that just snapped in ---------------------------------
  const [flashId, setFlashId] = useState<number | null>(null);
  const flash = useSharedValue(0);
  const onLocked = useCallback(
    (id: number) => {
      if (reduceMotion) return;
      setFlashId(id);
      flash.set(
        withSequence(withDelay(SNAP_FLASH_DELAY, withTiming(0.75, { duration: 90 })), withTiming(0, { duration: 420 })),
      );
    },
    [reduceMotion, flash],
  );

  const picture = useMemo(
    () =>
      image
        ? recordScene({
            puzzle,
            paths,
            image,
            state,
            layout,
            view,
            trayIds,
            hidden: dragging,
            selected: game.selected,
            refOpacity: props.refOpacity,
          })
        : null,
    [image, puzzle, paths, state, layout, view, trayIds, dragging, game.selected, props.refOpacity],
  );

  const pan = usePlayGestures({
    puzzle,
    game,
    layout,
    view,
    playArea,
    trayIds,
    reduceMotion,
    shapes,
    onPan: props.onPan,
    drag: { x: dragX, y: dragY, scale: dragScale, tilt: dragTilt },
    setDragging,
    onLocked,
  });

  // ---- live layer: dragged piece + pulsing hint target --------------------------------
  const draggedPath = dragging === null ? null : paths[dragging];
  const draggedCell = dragging === null ? null : puzzle.pieces[dragging]?.cell;
  // drag x/y is the piece's centre: it grows and leans around its middle
  const cx = (draggedCell?.x ?? 0) + (draggedCell?.w ?? 0) / 2;
  const cy = (draggedCell?.y ?? 0) + (draggedCell?.h ?? 0) / 2;
  const transform = useDerivedValue(() => [
    { translateX: dragX.value },
    { translateY: dragY.value },
    { rotate: dragTilt.value },
    { scale: dragScale.value },
    { translateX: -cx },
    { translateY: -cy },
  ]);
  // the shadow drops further away the higher the piece is lifted
  const shadow = useDerivedValue(() => {
    const lift = Math.max(0, dragScale.value / view.scale - 1) * 60;
    return [
      { translateX: dragX.value + 2 + lift * 0.4 },
      { translateY: dragY.value + 6 + lift },
      { rotate: dragTilt.value },
      { scale: dragScale.value },
      { translateX: -cx },
      { translateY: -cy },
    ];
  });
  const flashPath = flashId === null ? null : paths[flashId];

  const pulse = useSharedValue(1);
  useEffect(() => {
    if (game.hint === null || reduceMotion) {
      pulse.set(1);
      return;
    }
    pulse.set(withRepeat(withSequence(withTiming(0.25, { duration: 600 }), withTiming(1, { duration: 600 })), -1));
  }, [game.hint, reduceMotion, pulse]);
  const hintPath = game.hint === null ? null : paths[game.hint];
  const b = boardBand(layout);
  const band = { x: b.x, y: b.y, width: b.w, height: b.h };
  const boardTransform = [{ translateX: view.x }, { translateY: view.y }, { scale: view.scale }];

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={{ width: layout.width, height: layout.height }} accessibilityLabel={props.accessibilityLabel}>
        {picture ? <Picture picture={picture} /> : null}
        {hintPath ? (
          <Group clip={band}>
            <Group transform={boardTransform}>
              <Path
                path={hintPath}
                style="stroke"
                strokeWidth={5 / view.scale}
                color={palette.yellow700}
                opacity={pulse}
              />
            </Group>
          </Group>
        ) : null}
        {flashPath ? (
          <Group clip={band}>
            <Group transform={boardTransform}>
              <Path path={flashPath} color={palette.white} opacity={flash} />
            </Group>
          </Group>
        ) : null}
        {image && draggedPath ? (
          <>
            <Group transform={shadow}>
              <Path path={draggedPath} color={withAlpha(palette.ink, 0.22)} />
            </Group>
            <Group transform={transform} clip={draggedPath}>
              <SkiaImage
                image={image}
                x={0}
                y={0}
                width={puzzle.definition.width}
                height={puzzle.definition.height}
                fit="fill"
              />
            </Group>
          </>
        ) : null}
      </Canvas>
    </GestureDetector>
  );
}
