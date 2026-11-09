import { isComplete, type PieceShape, type Puzzle, type PuzzleState } from '@puzzle-studio/puzzle-engine';
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

import { boardBand, type PlayLayout } from '../game/layout';
import type { View } from '../game/viewport';

const imagePaint = Skia.Paint();
imagePaint.setAntiAlias(true);
/** The picture as a soft sepia shadow on the board – shows where everything belongs (concept 2 §10). */
const refPaint = Skia.Paint();
refPaint.setColorFilter(
  Skia.ColorFilter.MakeMatrix([
    0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0,
  ]),
);
const boardPaint = Skia.Paint();
boardPaint.setColor(Skia.Color(palette.white));
const targetPaint = Skia.Paint();
targetPaint.setStyle(PaintStyle.Stroke);
targetPaint.setAntiAlias(true);
targetPaint.setColor(Skia.Color(withAlpha(palette.slate300, 0.55)));
const edgePaint = Skia.Paint();
edgePaint.setStyle(PaintStyle.Stroke);
edgePaint.setAntiAlias(true);
edgePaint.setColor(Skia.Color(withAlpha(palette.white, 0.85)));
const selectPaint = Skia.Paint();
selectPaint.setStyle(PaintStyle.Stroke);
selectPaint.setAntiAlias(true);
selectPaint.setColor(Skia.Color(palette.yellow700));
/** Soft shadow under pieces lying in the piles. */
const pileShadowPaint = Skia.Paint();
pileShadowPaint.setAntiAlias(true);
pileShadowPaint.setColor(Skia.Color(withAlpha(palette.ink, 0.16)));
const pileGlowPaint = Skia.Paint();
pileGlowPaint.setAntiAlias(true);
pileGlowPaint.setColor(Skia.Color(withAlpha(palette.yellow, 0.7)));

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

/** Screen position (unturned cell top-left), scale and turn of a piece lying in pile place `i`. */
export function trayPlacement(puzzle: Puzzle, layout: PlayLayout, piece: PieceShape, i: number) {
  const spot = layout.spots[i] ?? { x: 0, y: 0, angle: 0 };
  const s = trayScale(puzzle, layout.slot);
  return {
    x: spot.x - (piece.cell.w / 2) * s,
    y: spot.y - (piece.cell.h / 2) * s,
    scale: s,
    angle: spot.angle,
  };
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
      // the board layer never reaches into the piles (zoom / toddler bites)
      const band = boardBand(layout);
      canvas.clipRect(rect(band.x, band.y, band.w, band.h), ClipOp.Intersect, true);
      canvas.translate(view.x, view.y);
      canvas.scale(view.scale, view.scale);
      canvas.drawRRect(rrect(rect(0, 0, W, H), 12 * hair, 12 * hair), boardPaint);
      if (isComplete(state)) {
        // finished: the joints disappear – one whole picture, like a real photo
        canvas.save();
        canvas.clipRRect(rrect(rect(0, 0, W, H), 12 * hair, 12 * hair), ClipOp.Intersect, true);
        canvas.drawImageRect(image, rect(0, 0, image.width(), image.height()), rect(0, 0, W, H), imagePaint);
        canvas.restore();
        canvas.restore();
        return;
      }
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

      // the piles: pieces lie a little turned, with a soft shadow; the selected one glows
      trayIds.forEach((id, slotIndex) => {
        const p = puzzle.pieces[id];
        const path = paths[id];
        if (id === hidden || !p || !path) return;
        const t = trayPlacement(puzzle, layout, p, slotIndex);
        const cx = p.cell.x + p.cell.w / 2;
        const cy = p.cell.y + p.cell.h / 2;
        canvas.save();
        canvas.translate(t.x + (p.cell.w / 2) * t.scale, t.y + (p.cell.h / 2) * t.scale);
        canvas.rotate((t.angle * 180) / Math.PI, 0, 0);
        canvas.scale(t.scale, t.scale);
        canvas.translate(-cx, -cy);
        if (id === selected) {
          canvas.drawCircle(cx, cy, Math.max(p.cell.w, p.cell.h) * 0.75, pileGlowPaint);
        }
        canvas.save();
        canvas.translate(3 / t.scale, 6 / t.scale);
        canvas.drawPath(path, pileShadowPaint);
        canvas.restore();
        drawPiece(canvas, image, path, W, H, 1.2 / t.scale);
        canvas.restore();
      });
    },
    { width: layout.width, height: layout.height },
  );
}
