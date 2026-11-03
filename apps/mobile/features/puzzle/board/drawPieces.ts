import type { PieceShape, Puzzle, PuzzleState } from '@puzzle-studio/puzzle-engine';
import { palette, withAlpha } from '@puzzle-studio/ui';
import {
  ClipOp,
  PaintStyle,
  Skia,
  createPicture,
  rect,
  rrect,
  type SkCanvas,
  type SkImage,
  type SkPath,
} from '@shopify/react-native-skia';

import { slotRect, type PlayLayout } from '../game/layout';
import type { View } from '../game/viewport';

const imagePaint = Skia.Paint();
imagePaint.setAntiAlias(true);
const refPaint = Skia.Paint();
const boardPaint = Skia.Paint();
boardPaint.setColor(Skia.Color(palette.white));
const targetPaint = Skia.Paint();
targetPaint.setStyle(PaintStyle.Stroke);
targetPaint.setAntiAlias(true);
targetPaint.setColor(Skia.Color(withAlpha(palette.greyPurple300, 0.55)));
const edgePaint = Skia.Paint();
edgePaint.setStyle(PaintStyle.Stroke);
edgePaint.setAntiAlias(true);
edgePaint.setColor(Skia.Color(withAlpha(palette.white, 0.85)));
const selectPaint = Skia.Paint();
selectPaint.setStyle(PaintStyle.Stroke);
selectPaint.setAntiAlias(true);
selectPaint.setColor(Skia.Color(palette.yellow700));
const slotPaint = Skia.Paint();
slotPaint.setColor(Skia.Color(withAlpha(palette.white, 0.75)));
const slotSelectedPaint = Skia.Paint();
slotSelectedPaint.setColor(Skia.Color(palette.yellow100));
const slotRingPaint = Skia.Paint();
slotRingPaint.setStyle(PaintStyle.Stroke);
slotRingPaint.setStrokeWidth(3);
slotRingPaint.setColor(Skia.Color(palette.yellow700));

/** Draws one piece at the canvas' current transform (piece in its home cell coordinates). */
export function drawPiece(canvas: SkCanvas, image: SkImage, path: SkPath, w: number, h: number, stroke: number) {
  canvas.save();
  canvas.clipPath(path, ClipOp.Intersect, true);
  canvas.drawImageRect(image, rect(0, 0, image.width(), image.height()), rect(0, 0, w, h), imagePaint);
  canvas.restore();
  edgePaint.setStrokeWidth(stroke);
  canvas.drawPath(path, edgePaint);
}

/** Uniform scale for pieces in the tray (largest piece bounds fill ~88 % of a slot). */
export function trayScale(puzzle: Puzzle, slot: number): number {
  let m = 0;
  for (const p of puzzle.pieces) m = Math.max(m, p.bounds.w, p.bounds.h);
  return (slot * 0.88) / m;
}

/** Screen position (cell top-left) and scale of a tray piece in slot `i`. */
export function trayPlacement(puzzle: Puzzle, layout: PlayLayout, piece: PieceShape, i: number) {
  const r = slotRect(layout, i);
  const s = trayScale(puzzle, layout.slot);
  const cx = piece.cell.x + piece.cell.w / 2;
  const cy = piece.cell.y + piece.cell.h / 2;
  return { x: r.x + r.w / 2 - (cx - piece.cell.x) * s, y: r.y + r.h / 2 - (cy - piece.cell.y) * s, scale: s };
}

export interface SceneInput {
  puzzle: Puzzle;
  paths: SkPath[];
  image: SkImage;
  state: PuzzleState;
  layout: PlayLayout;
  view: View;
  trayIds: readonly number[];
  hidden: number | null;
  selected: number | null;
  refOpacity: number;
}

/**
 * Static layer as ONE picture (re-recorded only when the state changes): board, faint
 * reference, target outlines, locked pieces, loose pieces and the tray. The dragged piece
 * is drawn live on top (gameplay-concept.md §7 Rendering).
 */
export function recordScene(i: SceneInput) {
  const { puzzle, paths, image, state, layout, view, trayIds, hidden, selected } = i;
  const { width: W, height: H } = puzzle.definition;
  const hair = 1 / view.scale;
  return createPicture(
    (canvas) => {
      canvas.save();
      // the board layer never reaches into the tray (zoom / toddler bites)
      canvas.clipRect(rect(0, 0, layout.width, layout.tray.y), ClipOp.Intersect, true);
      canvas.translate(view.x, view.y);
      canvas.scale(view.scale, view.scale);
      canvas.drawRRect(rrect(rect(0, 0, W, H), 12 * hair, 12 * hair), boardPaint);
      if (state.referenceVisible && i.refOpacity > 0) {
        refPaint.setAlphaf(i.refOpacity);
        canvas.drawImageRect(image, rect(0, 0, image.width(), image.height()), rect(0, 0, W, H), refPaint);
      }
      targetPaint.setStrokeWidth(1.2 * hair);
      puzzle.pieces.forEach((p, id) => {
        const path = paths[id];
        if (!path) return;
        if (state.pieces[id]?.state === 'locked') drawPiece(canvas, image, path, W, H, 0.6 * hair);
        else canvas.drawPath(path, targetPaint);
      });
      for (const id of state.z) {
        const rt = state.pieces[id];
        const p = puzzle.pieces[id];
        const path = paths[id];
        if (id === hidden || !rt || !p || !path) continue;
        canvas.save();
        canvas.translate(rt.x - p.cell.x, rt.y - p.cell.y);
        drawPiece(canvas, image, path, W, H, 1.2 * hair);
        if (id === selected) {
          selectPaint.setStrokeWidth(4 * hair);
          canvas.drawPath(path, selectPaint);
        }
        canvas.restore();
      }
      canvas.restore();

      trayIds.forEach((id, slotIndex) => {
        const r = slotRect(layout, slotIndex);
        const sel = id === selected;
        canvas.drawRRect(rrect(rect(r.x, r.y, r.w, r.h), 16, 16), sel ? slotSelectedPaint : slotPaint);
        if (sel) canvas.drawRRect(rrect(rect(r.x, r.y, r.w, r.h), 16, 16), slotRingPaint);
        const p = puzzle.pieces[id];
        const path = paths[id];
        if (id === hidden || !p || !path) return;
        const t = trayPlacement(puzzle, layout, p, slotIndex);
        canvas.save();
        canvas.translate(t.x, t.y);
        canvas.scale(t.scale, t.scale);
        canvas.translate(-p.cell.x, -p.cell.y);
        drawPiece(canvas, image, path, W, H, 1.2 / t.scale);
        canvas.restore();
      });
    },
    { width: layout.width, height: layout.height },
  );
}
