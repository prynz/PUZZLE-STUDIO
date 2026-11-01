/**
 * THROWAWAY benchmark geometry (Phase 1 performance spike).
 *
 * Produces jigsaw-like piece outlines so the 256-piece rendering test uses
 * realistic path complexity. The production implementation is
 * `packages/puzzle-engine` (Phase 4) and will replace this file.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BenchPiece {
  id: number;
  row: number;
  col: number;
  /** SVG path in board coordinates. */
  d: string;
  cell: Rect;
}

type Point = readonly [number, number];
type Cubic = readonly [Point, Point, Point, Point];

/** mulberry32 – small deterministic PRNG. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tab template: u along the edge, v outward (fraction of edge length).
const TAB: readonly Cubic[] = [
  [
    [0, 0],
    [0.32, 0],
    [0.42, 0.02],
    [0.4, 0.1],
  ],
  [
    [0.4, 0.1],
    [0.37, 0.2],
    [0.38, 0.27],
    [0.5, 0.27],
  ],
  [
    [0.5, 0.27],
    [0.62, 0.27],
    [0.63, 0.2],
    [0.6, 0.1],
  ],
  [
    [0.6, 0.1],
    [0.58, 0.02],
    [0.68, 0],
    [1, 0],
  ],
];

function edge(p0: Point, p1: Point, sign: number, jitter = 0): Cubic[] {
  if (sign === 0) return [[p0, p0, p1, p1]];
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const map = ([u, v]: Point): Point => {
    const uu = u === 0 || u === 1 ? u : u + jitter;
    return [p0[0] + dx * uu + nx * v * len * sign, p0[1] + dy * uu + ny * v * len * sign];
  };
  return TAB.map(([a, b, c, d]) => [map(a), map(b), map(c), map(d)] as const);
}

const reverse = (segs: Cubic[]): Cubic[] =>
  segs
    .slice()
    .reverse()
    .map(([a, b, c, d]) => [d, c, b, a] as const);
const fmt = (p: Point) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

function at<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) throw new Error(`index ${i} out of range`);
  return v;
}

export function generatePieces(rows: number, cols: number, width: number, height: number, seed: number): BenchPiece[] {
  const r = rng(seed);
  const pw = width / cols;
  const ph = height / rows;
  // hEdges[i][j]: edge between row i-1 and row i (left → right)
  const hEdges: Cubic[][][] = [];
  for (let i = 0; i <= rows; i++) {
    const row: Cubic[][] = [];
    for (let j = 0; j < cols; j++) {
      const inner = i > 0 && i < rows;
      row.push(
        edge(
          [j * pw, i * ph],
          [(j + 1) * pw, i * ph],
          inner ? (r() < 0.5 ? 1 : -1) : 0,
          inner ? (r() - 0.5) * 0.08 : 0,
        ),
      );
    }
    hEdges.push(row);
  }
  // vEdges[j][i]: edge between col j-1 and col j (top → bottom)
  const vEdges: Cubic[][][] = [];
  for (let j = 0; j <= cols; j++) {
    const col: Cubic[][] = [];
    for (let i = 0; i < rows; i++) {
      const inner = j > 0 && j < cols;
      col.push(
        edge(
          [j * pw, i * ph],
          [j * pw, (i + 1) * ph],
          inner ? (r() < 0.5 ? 1 : -1) : 0,
          inner ? (r() - 0.5) * 0.08 : 0,
        ),
      );
    }
    vEdges.push(col);
  }
  const pieces: BenchPiece[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const segs = [
        ...at(at(hEdges, i), j),
        ...at(at(vEdges, j + 1), i),
        ...reverse(at(at(hEdges, i + 1), j)),
        ...reverse(at(at(vEdges, j), i)),
      ];
      const first = at(segs, 0)[0];
      const d = `M${fmt(first)} ` + segs.map(([, c1, c2, p]) => `C${fmt(c1)} ${fmt(c2)} ${fmt(p)}`).join(' ') + 'Z';
      pieces.push({ id: i * cols + j, row: i, col: j, d, cell: { x: j * pw, y: i * ph, w: pw, h: ph } });
    }
  }
  return pieces;
}

/** Random top-left positions for every piece inside `area` (deterministic). */
export function scatter(pieces: readonly BenchPiece[], area: Rect, seed: number): { xs: number[]; ys: number[] } {
  const r = rng(seed);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of pieces) {
    xs.push(area.x + r() * Math.max(0, area.w - p.cell.w));
    ys.push(area.y + r() * Math.max(0, area.h - p.cell.h));
  }
  return { xs, ys };
}

/**
 * Topmost piece whose cell (+ tab margin) contains the point. `order` is the
 * z-order (last = top). Runs on the UI thread, hence the worklet directive.
 */
export function hitTest(
  x: number,
  y: number,
  xs: readonly number[],
  ys: readonly number[],
  order: readonly number[],
  cellW: number,
  cellH: number,
): number {
  'worklet';
  const mx = cellW * 0.2;
  const my = cellH * 0.2;
  for (let k = order.length - 1; k >= 0; k--) {
    const id = order[k];
    if (id === undefined) continue;
    const px = xs[id];
    const py = ys[id];
    if (px === undefined || py === undefined) continue;
    if (x >= px - mx && x <= px + cellW + mx && y >= py - my && y <= py + cellH + my) return id;
  }
  return -1;
}
