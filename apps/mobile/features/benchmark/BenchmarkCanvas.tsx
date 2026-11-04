import {
  Canvas,
  ClipOp,
  Group,
  Image as SkiaImage,
  PaintStyle,
  Path,
  Picture,
  Skia,
  createPicture,
  rect,
  useImage,
  type SkCanvas,
  type SkImage,
  type SkPath,
} from '@shopify/react-native-skia';
import {
  ENGINE_VERSION,
  buildHitGrid,
  generatePuzzle,
  hitShapesFor,
  hitTest,
  toSvgPath,
  type PieceShape,
} from '@puzzle-studio/puzzle-engine';
import { palette, withAlpha } from '@puzzle-studio/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import sample from '@/assets/samples/meadow-house.jpg';

import { measureHitTest, scatter } from './scatter';

export const ROWS = 16;
export const COLS = 16;
const PAD = 8;

export interface BenchmarkStats {
  pieces: number;
  buildMs: number;
  recordMs: number;
  /** Engine hit-test, average µs per touch on this device. */
  hitUs: number;
  fps: number;
  minFps: number;
  moves: number;
}

interface Props {
  width: number;
  height: number;
  seed: number;
  onStats: (update: Partial<BenchmarkStats>) => void;
}

const imagePaint = Skia.Paint();
const ghostPaint = Skia.Paint();
ghostPaint.setAlphaf(0.18);
const outlinePaint = Skia.Paint();
outlinePaint.setStyle(PaintStyle.Stroke);
outlinePaint.setStrokeWidth(1);
outlinePaint.setAntiAlias(true);
outlinePaint.setColor(Skia.Color(withAlpha(palette.white, 0.9)));
const liftShadow = withAlpha(palette.ink, 0.22);

function drawPiece(
  canvas: SkCanvas,
  image: SkImage,
  piece: PieceShape,
  path: SkPath,
  x: number,
  y: number,
  boardW: number,
  boardH: number,
) {
  canvas.save();
  canvas.translate(x - piece.cell.x, y - piece.cell.y);
  canvas.save();
  canvas.clipPath(path, ClipOp.Intersect, true);
  canvas.drawImageRect(image, rect(0, 0, image.width(), image.height()), rect(0, 0, boardW, boardH), imagePaint);
  canvas.restore();
  canvas.drawPath(path, outlinePaint);
  canvas.restore();
}

/**
 * 256-piece rendering benchmark.
 * Strategy under test (planned for Phase 5): all resting pieces are recorded
 * into ONE SkPicture; only the dragged piece is drawn live from shared values
 * on the UI thread. The picture is re-recorded on drag start / drop.
 */
export function BenchmarkCanvas({ width, height, seed, onStats }: Props) {
  const image = useImage(sample);
  const boardW = width - PAD * 2;
  const boardH = boardW * 0.75;
  const pw = boardW / COLS;
  const ph = boardH / ROWS;

  const geometry = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- benchmark: timing is the purpose of this memo
    const t0 = performance.now();
    const puzzle = generatePuzzle({
      engineVersion: ENGINE_VERSION,
      seed: 7,
      rows: ROWS,
      cols: COLS,
      shape: 'classic',
      width: boardW,
      height: boardH,
    });
    const pieces = puzzle.pieces;
    const paths = pieces.map((p) => Skia.Path.MakeFromSVGString(toSvgPath(p.path)) ?? Skia.Path.Make());
    // eslint-disable-next-line react-hooks/purity -- benchmark timing
    return { pieces, paths, shapes: hitShapesFor(puzzle), buildMs: performance.now() - t0 };
  }, [boardW, boardH]);

  const initial = useMemo(
    () => scatter(geometry.pieces, { x: PAD, y: PAD, w: width - PAD * 2, h: height - PAD * 2 }, seed),
    [geometry, width, height, seed],
  );
  const [pos, setPos] = useState(initial);
  const [order, setOrder] = useState<number[]>(() => geometry.pieces.map((p) => p.id));
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    onStats({ pieces: geometry.pieces.length, buildMs: geometry.buildMs });
  }, [geometry, onStats]);

  // Engine hit-test index over the play area (rebuilt after each drop – O(n), < 1 ms).
  const playArea = useMemo(() => ({ x: 0, y: 0, w: width, h: height }), [width, height]);
  const grid = useMemo(
    () => buildHitGrid(geometry.shapes, pos.xs, pos.ys, order, playArea, Math.max(pw, ph)),
    [geometry, pos, order, playArea, pw, ph],
  );
  const zRank = useMemo(() => {
    const rank = new Array<number>(geometry.pieces.length).fill(-1);
    order.forEach((id, i) => (rank[id] = i));
    return rank;
  }, [geometry, order]);

  useEffect(() => {
    const us = measureHitTest((x, y) => hitTest(x, y, grid, geometry.shapes, pos.xs, pos.ys, zRank), playArea);
    onStats({ hitUs: us });
    // measured once per layout/shuffle, not after every move
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, playArea]);

  // ---- shared state for the UI thread ------------------------------------
  const xs = useSharedValue<number[]>(initial.xs);
  const ys = useSharedValue<number[]>(initial.ys);
  const hitGrid = useSharedValue(grid);
  const ranks = useSharedValue<number[]>(zRank);
  const shapes = useSharedValue(geometry.shapes);
  const activeId = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const offX = useSharedValue(0);
  const offY = useSharedValue(0);
  const cellX = useSharedValue(0);
  const cellY = useSharedValue(0);

  useEffect(() => {
    xs.value = pos.xs;
    ys.value = pos.ys;
  }, [pos, xs, ys]);
  useEffect(() => {
    hitGrid.set(grid);
    ranks.set(zRank);
    shapes.set(geometry.shapes);
  }, [grid, zRank, geometry, hitGrid, ranks, shapes]);

  // ---- static layer: one picture with all resting pieces -----------------
  const picture = useMemo(() => {
    if (!image) return null;
    // eslint-disable-next-line react-hooks/purity -- benchmark: measures picture recording time
    const t0 = performance.now();
    const pic = createPicture(
      (canvas) => {
        canvas.drawImageRect(
          image,
          rect(0, 0, image.width(), image.height()),
          rect(PAD, PAD, boardW, boardH),
          ghostPaint,
        );
        for (const id of order) {
          if (id === dragging) continue;
          const piece = geometry.pieces[id];
          const path = geometry.paths[id];
          const x = pos.xs[id];
          const y = pos.ys[id];
          if (!piece || !path || x === undefined || y === undefined) continue;
          drawPiece(canvas, image, piece, path, x, y, boardW, boardH);
        }
      },
      { width, height },
    );
    // eslint-disable-next-line react-hooks/purity -- benchmark timing
    return { pic, ms: performance.now() - t0 };
  }, [image, order, dragging, geometry, pos, boardW, boardH, width, height]);

  useEffect(() => {
    if (picture) onStats({ recordMs: picture.ms });
  }, [picture, onStats]);

  // ---- JS-side drag bookkeeping --------------------------------------------
  const moves = useRef(0);
  const startDrag = useCallback((id: number) => setDragging(id), []);
  const endDrag = useCallback(
    (id: number, x: number, y: number) => {
      setPos((prev) => {
        const nx = prev.xs.slice();
        const ny = prev.ys.slice();
        nx[id] = x;
        ny[id] = y;
        return { xs: nx, ys: ny };
      });
      setOrder((prev) => [...prev.filter((p) => p !== id), id]);
      setDragging(null);
      moves.current += 1;
      onStats({ moves: moves.current });
    },
    [onStats],
  );

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      'worklet';
      const id = hitTest(e.x, e.y, hitGrid.value, shapes.value, xs.value, ys.value, ranks.value);
      activeId.value = id;
      if (id < 0) return;
      const px = xs.value[id] ?? 0;
      const py = ys.value[id] ?? 0;
      offX.value = e.x - px;
      offY.value = e.y - py;
      dragX.value = px;
      dragY.value = py;
      cellX.value = shapes.value.cellX[id] ?? 0;
      cellY.value = shapes.value.cellY[id] ?? 0;
      scheduleOnRN(startDrag, id);
    },
    onUpdate: (e) => {
      'worklet';
      if (activeId.value < 0) return;
      dragX.value = e.x - offX.value;
      dragY.value = e.y - offY.value;
    },
    onFinalize: () => {
      'worklet';
      const id = activeId.value;
      if (id < 0) return;
      activeId.value = -1;
      scheduleOnRN(endDrag, id, dragX.value, dragY.value);
    },
  });

  const dragTransform = useDerivedValue(() => [
    { translateX: dragX.value - cellX.value },
    { translateY: dragY.value - cellY.value },
  ]);
  const shadowTransform = useDerivedValue(() => [
    { translateX: dragX.value - cellX.value + 1 },
    { translateY: dragY.value - cellY.value + 5 },
  ]);

  // ---- frame-rate meter (UI thread) ---------------------------------------
  const acc = useSharedValue(0);
  const frames = useSharedValue(0);
  const worst = useSharedValue(0);
  const report = useCallback((fps: number, minFps: number) => onStats({ fps, minFps }), [onStats]);
  useFrameCallback((info) => {
    'worklet';
    const dt = info.timeSincePreviousFrame;
    if (dt === null || dt <= 0) return;
    acc.value += dt;
    frames.value += 1;
    worst.value = Math.max(worst.value, dt);
    if (acc.value >= 500) {
      scheduleOnRN(report, (1000 * frames.value) / acc.value, 1000 / worst.value);
      acc.value = 0;
      frames.value = 0;
      worst.value = 0;
    }
  });

  const draggedPath = dragging === null ? null : geometry.paths[dragging];

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={{ width, height }} accessibilityLabel="Benchmark-Spielfläche mit 256 Teilen">
        {picture ? <Picture picture={picture.pic} /> : null}
        {image && draggedPath ? (
          <>
            <Group transform={shadowTransform}>
              <Path path={draggedPath} color={liftShadow} />
            </Group>
            <Group transform={dragTransform} clip={draggedPath}>
              <SkiaImage image={image} x={0} y={0} width={boardW} height={boardH} fit="fill" />
            </Group>
            <Group transform={dragTransform}>
              <Path path={draggedPath} style="stroke" strokeWidth={1.5} color={palette.white} />
            </Group>
          </>
        ) : null}
      </Canvas>
    </GestureDetector>
  );
}
