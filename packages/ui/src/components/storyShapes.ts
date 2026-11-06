/**
 * Geometry for the story elements on the start screen (pure, tested in test/storyShapes.test.ts).
 *
 * - `pieceCardPath`: a card outline shaped like a puzzle piece – rounded rectangle with a knob
 *   on the top edge and a socket in the left edge, so the cards read as "pieces of a story".
 * - `trailPoints` / `trailPath`: the winding path of Pino's journey through the milestones.
 */

export interface PieceCardShape {
  /** Corner radius of the card body. */
  radius: number;
  /** Radius of the knob on the top edge; the knob sticks out `knobHeight(knobRadius)` above the body. */
  knobRadius: number;
  /** Knob centre as share of the width (0…1). */
  knobAt: number;
  /** Radius of the socket in the left edge (0 = none). */
  socketRadius: number;
}

/** Height the knob sticks out above the card body. */
export const knobHeight = (knobRadius: number) => knobRadius * 2.1;

const f = (n: number) => Math.round(n * 10) / 10;

/** SVG path of a puzzle-piece card that fills `width × height` (knob included). */
export function pieceCardPath(width: number, height: number, s: PieceCardShape): string {
  const top = knobHeight(s.knobRadius);
  const r = Math.min(s.radius, (height - top) / 2, width / 2);
  const kr = s.knobRadius;
  const kx = width * s.knobAt;
  const neck = kr * 0.6;
  const fillet = kr * 0.25;
  // the knob circle meets the neck lines a little above the card body
  const cy = top - kr * 1.1;
  const neckY = cy + Math.sqrt(kr * kr - neck * neck);
  const my = top + (height - top) / 2;
  const sr = s.socketRadius;
  const socketNeck = sr * 0.75;
  const parts = [
    `M0 ${f(top + r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(top)}`,
    `L${f(kx - neck - fillet)} ${f(top)}`,
    `Q${f(kx - neck)} ${f(top)} ${f(kx - neck)} ${f(top - fillet)}`,
    `L${f(kx - neck)} ${f(neckY)}`,
    `A${f(kr)} ${f(kr)} 0 1 1 ${f(kx + neck)} ${f(neckY)}`,
    `L${f(kx + neck)} ${f(top - fillet)}`,
    `Q${f(kx + neck)} ${f(top)} ${f(kx + neck + fillet)} ${f(top)}`,
    `L${f(width - r)} ${f(top)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(width)} ${f(top + r)}`,
    `L${f(width)} ${f(height - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(width - r)} ${f(height)}`,
    `L${f(r)} ${f(height)}`,
    `A${f(r)} ${f(r)} 0 0 1 0 ${f(height - r)}`,
  ];
  if (sr > 0) {
    parts.push(
      `L0 ${f(my + socketNeck)}`,
      // bulges into the card (counter-clockwise while walking up the left edge)
      `A${f(sr)} ${f(sr)} 0 1 0 0 ${f(my - socketNeck)}`,
    );
  }
  parts.push('Z');
  return parts.join(' ');
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
