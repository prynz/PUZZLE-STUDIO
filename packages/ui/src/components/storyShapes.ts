/**
 * Geometry for the story elements on the start screen (pure, tested in test/storyShapes.test.ts).
 *
 * - `pieceCardPath`: a card outline shaped like a puzzle piece – asymmetric rounded body with a
 *   soft knob on the top edge, so the cards read as "pieces of a story".
 * - `trailPoints` / `trailPath`: the winding path of Pino's journey through the milestones.
 */

export interface PieceCardShape {
  /** Corner radii clockwise from top left – unequal radii give the card its asymmetric, organic look. */
  radii: readonly [number, number, number, number];
  /** Size of the knob on the top edge; it sticks out `knobHeight(knobRadius)` above the body. */
  knobRadius: number;
  /** Knob centre as share of the width (0…1). */
  knobAt: number;
}

/** Height the knob sticks out above the card body. */
export const knobHeight = (knobRadius: number) => knobRadius * 2.25;

const f = (n: number) => Math.round(n * 10) / 10;

/**
 * SVG path of a puzzle-piece card that fills `width × height` (knob included): rounded body
 * with a soft knob – a round head (circle of `knobRadius`) on a gently flaring neck. The neck
 * curves meet the head along its tangent and leave the edge flat, so there are no corners.
 */
export function pieceCardPath(width: number, height: number, s: PieceCardShape): string {
  const top = knobHeight(s.knobRadius);
  const max = Math.min((height - top) / 2, width / 2);
  const [tl, tr, br, bl] = s.radii.map((r) => Math.min(r, max)) as [number, number, number, number];
  const k = s.knobRadius;
  const kx = Math.min(Math.max(width * s.knobAt, tl + 1.7 * k), width - tr - 1.7 * k);
  const y = (d: number) => f(top - d * k); // height above the body edge, in knob units
  const x = (d: number) => f(kx + d * k);
  // head: centre 1.25 k above the edge; the neck joins it 40° below its widest point
  const jx = Math.cos((40 * Math.PI) / 180);
  const jy = 1.25 - Math.sin((40 * Math.PI) / 180);
  return [
    `M0 ${f(top + tl)}`,
    `A${f(tl)} ${f(tl)} 0 0 1 ${f(tl)} ${f(top)}`,
    `L${x(-1.7)} ${f(top)}`,
    `C${x(-0.95)} ${f(top)} ${x(-jx + 0.32)} ${y(jy - 0.38)} ${x(-jx)} ${y(jy)}`,
    `A${f(k)} ${f(k)} 0 1 1 ${x(jx)} ${y(jy)}`,
    `C${x(jx - 0.32)} ${y(jy - 0.38)} ${x(0.95)} ${f(top)} ${x(1.7)} ${f(top)}`,
    `L${f(width - tr)} ${f(top)}`,
    `A${f(tr)} ${f(tr)} 0 0 1 ${f(width)} ${f(top + tr)}`,
    `L${f(width)} ${f(height - br)}`,
    `A${f(br)} ${f(br)} 0 0 1 ${f(width - br)} ${f(height)}`,
    `L${f(bl)} ${f(height)}`,
    `A${f(bl)} ${f(bl)} 0 0 1 0 ${f(height - bl)}`,
    'Z',
  ].join(' ');
}

export interface TrailPoint {
  x: number;
  y: number;
}

/** Station centres along a gentle wave: `step` apart, starting at `start`, around the middle `mid`. */
export function trailPoints(count: number, step: number, start: number, mid: number, amplitude: number): TrailPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: start + i * step,
    y: mid + amplitude * Math.sin(i * 1.15 + 0.4),
  }));
}

/** Smooth path through the points (horizontal tangents, so the trail never kinks). */
export function trailPath(points: readonly TrailPoint[]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let d = `M${f(first.x)} ${f(first.y)}`;
  let prev = first;
  for (const p of rest) {
    const cx = (prev.x + p.x) / 2;
    d += ` C${f(cx)} ${f(prev.y)} ${f(cx)} ${f(p.y)} ${f(p.x)} ${f(p.y)}`;
    prev = p;
  }
  return d;
}
