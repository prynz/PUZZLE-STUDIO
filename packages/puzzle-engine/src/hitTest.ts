/**
 * Hit-testing for loose pieces (docs/puzzle-engine/geometry.md §Hit-Testing).
 *
 * Built from plain arrays/objects only, and the query functions carry the 'worklet'
 * directive, so the same code runs on the JS thread and on the UI thread (Reanimated).
 * Locked and tray pieces are never part of the index – locked pieces cannot be grabbed.
 */
import type { Puzzle, Rect } from './types.ts';

/** Static per-piece data (does not change while playing). */
export interface HitShapes {
  /** Flattened outlines at the home position. */
  outlines: number[][];
  /** Home cell origin. */
  cellX: number[];
  cellY: number[];
  /** Bounds relative to the cell origin. */
  bx: number[];
  by: number[];
  bw: number[];
  bh: number[];
}

/** Uniform grid of buckets over the play area; rebuilt (cheaply) after each drop. */
export interface HitGrid {
  x0: number;
  y0: number;
  size: number;
  cols: number;
  rows: number;
  buckets: number[][];
}

export function hitShapesFor(puzzle: Puzzle): HitShapes {
  const s: HitShapes = { outlines: [], cellX: [], cellY: [], bx: [], by: [], bw: [], bh: [] };
  for (const p of puzzle.pieces) {
    s.outlines.push(p.outline);
    s.cellX.push(p.cell.x);
    s.cellY.push(p.cell.y);
    s.bx.push(p.bounds.x - p.cell.x);
    s.by.push(p.bounds.y - p.cell.y);
    s.bw.push(p.bounds.w);
    s.bh.push(p.bounds.h);
  }
  return s;
}

/** Even–odd ray casting on a flat [x0, y0, x1, y1, …] polygon. */
export function pointInPolygon(px: number, py: number, poly: readonly number[]): boolean {
  'worklet';
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
    const xi = poly[i] as number;
    const yi = poly[i + 1] as number;
    const xj = poly[j] as number;
    const yj = poly[j + 1] as number;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function clampIndex(v: number, max: number): number {
  'worklet';
  return v < 0 ? 0 : v > max ? max : v;
}

/**
 * Index the given loose pieces. `xs/ys` = top-left of each piece's cell in image space.
 * Pieces outside the area are clamped into the border buckets, so queries stay correct.
 */
export function buildHitGrid(
  shapes: HitShapes,
  xs: readonly number[],
  ys: readonly number[],
  loose: readonly number[],
  area: Rect,
  size: number,
): HitGrid {
  const cols = Math.max(1, Math.ceil(area.w / size));
  const rows = Math.max(1, Math.ceil(area.h / size));
  const buckets: number[][] = Array.from({ length: cols * rows }, () => []);
  for (const id of loose) {
    const x = (xs[id] ?? 0) + (shapes.bx[id] ?? 0);
    const y = (ys[id] ?? 0) + (shapes.by[id] ?? 0);
    const c0 = clampIndex(Math.floor((x - area.x) / size), cols - 1);
    const c1 = clampIndex(Math.floor((x + (shapes.bw[id] ?? 0) - area.x) / size), cols - 1);
    const r0 = clampIndex(Math.floor((y - area.y) / size), rows - 1);
    const r1 = clampIndex(Math.floor((y + (shapes.bh[id] ?? 0) - area.y) / size), rows - 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) buckets[r * cols + c]?.push(id);
  }
  return { x0: area.x, y0: area.y, size, cols, rows, buckets };
}

/**
 * Topmost loose piece under (x, y) – exact outline test, so tabs grab and blanks don't.
 * `zRank[id]` = stacking rank (higher = on top). Returns -1 if nothing is hit.
 */
export function hitTest(
  x: number,
  y: number,
  grid: HitGrid,
  shapes: HitShapes,
  xs: readonly number[],
  ys: readonly number[],
  zRank: readonly number[],
): number {
  'worklet';
  const c = clampIndex(Math.floor((x - grid.x0) / grid.size), grid.cols - 1);
  const r = clampIndex(Math.floor((y - grid.y0) / grid.size), grid.rows - 1);
  const bucket = grid.buckets[r * grid.cols + c];
  if (!bucket) return -1;
  let best = -1;
  let bestRank = -1;
  for (let k = 0; k < bucket.length; k++) {
    const id = bucket[k] as number;
    const rank = zRank[id] ?? -1;
    if (rank <= bestRank) continue;
    const px = xs[id] ?? 0;
    const py = ys[id] ?? 0;
    const lx = x - px;
    const ly = y - py;
    const bx = shapes.bx[id] ?? 0;
    const by = shapes.by[id] ?? 0;
    if (lx < bx || ly < by || lx > bx + (shapes.bw[id] ?? 0) || ly > by + (shapes.bh[id] ?? 0)) continue;
    const outline = shapes.outlines[id];
    // outlines are stored at the home cell → move the touch point there
    if (outline && pointInPolygon(x - px + (shapes.cellX[id] ?? 0), y - py + (shapes.cellY[id] ?? 0), outline)) {
      best = id;
      bestRank = rank;
    }
  }
  return best;
}
