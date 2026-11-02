/**
 * Jigsaw edges. Every inner edge is generated exactly once and shared by both
 * neighbours (one walks it forward, the other backward) → perfect fit, no gaps.
 */
import type { EdgeSign, PathCommand, Point } from './types.ts';

export type Cubic = readonly [Point, Point, Point, Point];

/** Tab template: u along the edge (0..1), v outward in units of the tab base (≤ 0.22). */
const TAB: readonly (readonly [number, number])[][] = [
  [
    [0, 0],
    [0.34, 0],
    [0.43, 0.012],
    [0.41, 0.06],
  ],
  [
    [0.41, 0.06],
    [0.36, 0.12],
    [0.33, 0.216],
    [0.5, 0.216],
  ],
  [
    [0.5, 0.216],
    [0.67, 0.216],
    [0.64, 0.12],
    [0.59, 0.06],
  ],
  [
    [0.59, 0.06],
    [0.57, 0.012],
    [0.66, 0],
    [1, 0],
  ],
];

/** Largest outward extent of a tab as a fraction of the tab base (template max × max size). */
export const TAB_MAX_EXTENT = 0.216 * 1.1;

/** Samples per cubic when flattening (4 cubics × 6 = 24 points per tab edge). */
const STEPS = 6;

export interface Edge {
  from: Point;
  to: Point;
  /** null = straight edge */
  cubics: Cubic[] | null;
  /** Flattened polyline including both end points. */
  points: Point[];
}

export interface TabVariation {
  /** Direction the tab bulges for sign = +1 (unit vector). */
  dir: Point;
  sign: EdgeSign;
  /** Shift of the tab centre along the edge (fraction of the edge, ±0.04). */
  shift: number;
  /** Tab size factor (0.92 … 1.1). */
  size: number;
  /** Absolute length that v = 1 corresponds to (min of piece width/height). */
  base: number;
}

function cubicAt(c: Cubic, t: number): Point {
  const s = 1 - t;
  const a = s * s * s;
  const b = 3 * s * s * t;
  const d = 3 * s * t * t;
  const e = t * t * t;
  return {
    x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x,
    y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y,
  };
}

export function straightEdge(from: Point, to: Point): Edge {
  return { from, to, cubics: null, points: [from, to] };
}

export function tabEdge(from: Point, to: Point, v: TabVariation): Edge {
  if (v.sign === 0) return straightEdge(from, to);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const out = v.sign * v.size * v.base;
  const map = ([u, w]: readonly [number, number]): Point => {
    if (u === 0) return from;
    if (u === 1) return to;
    const uu = u + v.shift;
    return { x: from.x + dx * uu + v.dir.x * w * out, y: from.y + dy * uu + v.dir.y * w * out };
  };
  const cubics = TAB.map((seg) => seg.map(map) as unknown as Cubic); // 4-tuple by construction of TAB
  const points: Point[] = [from];
  for (const c of cubics) for (let k = 1; k <= STEPS; k++) points.push(k === STEPS ? c[3] : cubicAt(c, k / STEPS));
  return { from, to, cubics, points };
}

/** Same edge walked backwards (shares the exact same points). */
export function reversed(e: Edge): Edge {
  return {
    from: e.to,
    to: e.from,
    cubics: e.cubics ? e.cubics.map(([a, b, c, d]) => [d, c, b, a] as const).reverse() : null,
    points: e.points.slice().reverse(),
  };
}

/** Path commands for an edge (without the initial move). */
export function edgeCommands(e: Edge): PathCommand[] {
  if (!e.cubics) return [{ op: 'L', x: e.to.x, y: e.to.y }];
  return e.cubics.map(([, c1, c2, p]) => ({ op: 'C', x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, x: p.x, y: p.y }));
}

/** All points that bound the edge (polyline + control points → the curve lies inside their hull). */
export function edgeExtentPoints(e: Edge): Point[] {
  return e.cubics ? [...e.points, ...e.cubics.flatMap((c) => [c[1], c[2]])] : e.points;
}
