/**
 * "Häppchen-Modus" for the toddler profile (docs/product/gameplay-concept.md §2):
 * the picture is played in small connected regions of 4–9 pieces, frame first, then inwards.
 */
import { BITES_FROM_PIECES } from './assist.ts';
import type { PuzzleState } from './state.ts';
import type { Puzzle, Rect } from './types.ts';

export interface Bite {
  id: number;
  pieces: number[];
  /** Region in image space (for the automatic zoom). */
  rect: Rect;
}

/** Splits n into near-equal parts of 2 or 3 (n ≥ 2). */
export function splitTwosThrees(n: number): number[] {
  const parts = Math.ceil(n / 3);
  const base = Math.floor(n / parts);
  const extra = n % parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Plans the bites. Small puzzles (< 25 pieces) are one bite. Order: outer ring of blocks first
 * (clockwise from the top-left), then the next ring inwards. Deterministic.
 */
export function planBites(puzzle: Puzzle): Bite[] {
  const { rows, cols } = puzzle.definition;
  const { pieceWidth: pw, pieceHeight: ph } = puzzle;
  if (rows * cols < BITES_FROM_PIECES) {
    return [{ id: 0, pieces: puzzle.pieces.map((p) => p.id), rect: { x: 0, y: 0, w: cols * pw, h: rows * ph } }];
  }
  const rowParts = splitTwosThrees(rows);
  const colParts = splitTwosThrees(cols);
  const R = rowParts.length;
  const C = colParts.length;

  const blocks: { br: number; bc: number; pieces: number[]; rect: Rect }[] = [];
  let r0 = 0;
  rowParts.forEach((rh, br) => {
    let c0 = 0;
    colParts.forEach((cw, bc) => {
      const pieces: number[] = [];
      for (let r = r0; r < r0 + rh; r++) for (let c = c0; c < c0 + cw; c++) pieces.push(r * cols + c);
      blocks.push({ br, bc, pieces, rect: { x: c0 * pw, y: r0 * ph, w: cw * pw, h: rh * ph } });
      c0 += cw;
    });
    r0 += rh;
  });

  // ring index + clockwise position along the ring
  const ringOf = (b: { br: number; bc: number }) => Math.min(b.br, b.bc, R - 1 - b.br, C - 1 - b.bc);
  const along = (b: { br: number; bc: number }) => {
    const k = ringOf(b);
    const top = k;
    const left = k;
    const bottom = R - 1 - k;
    const right = C - 1 - k;
    const w = right - left;
    const h = bottom - top;
    if (b.br === top) return b.bc - left; // top: left → right
    if (b.bc === right) return w + (b.br - top); // right: top → bottom
    if (b.br === bottom) return w + h + (right - b.bc); // bottom: right → left
    return 2 * w + h + (bottom - b.br); // left: bottom → top
  };
  return blocks
    .slice()
    .sort((a, b) => ringOf(a) - ringOf(b) || along(a) - along(b))
    .map((b, id) => ({ id, pieces: b.pieces, rect: b.rect }));
}

/** First bite that still has unplaced pieces (null = puzzle complete). */
export function activeBite(bites: readonly Bite[], state: PuzzleState): Bite | null {
  return bites.find((b) => b.pieces.some((id) => state.pieces[id]?.state !== 'locked')) ?? null;
}

/** The few big pieces the toddler tray shows: tray pieces of the bite, in tray order. */
export function biteTray(bite: Bite, state: PuzzleState, max = 4): number[] {
  const inBite = new Set(bite.pieces);
  return state.trayOrder.filter((id) => inBite.has(id)).slice(0, max);
}
