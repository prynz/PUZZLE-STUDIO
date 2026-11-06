import { describe, expect, it } from 'vitest';

import { knobHeight, pieceCardPath, trailPath, trailPoints } from '../src/components/storyShapes.ts';

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('pieceCardPath', () => {
  const shape = { radii: [40, 18, 40, 18] as const, knobRadius: 18, knobAt: 0.74 };

  it('is a closed outline inside the box', () => {
    const d = pieceCardPath(300, 216, shape);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    // coordinates, radii and arc flags – none leaves the 300 × 216 box (the knob reaches y = 0)
    for (const n of numbers(d)) expect(n).toBeGreaterThanOrEqual(0);
    for (const n of numbers(d)) expect(n).toBeLessThanOrEqual(300);
    expect(knobHeight(20)).toBeGreaterThan(20 * 2 * 0.9); // knob is roughly a full circle high
  });

  it('is one smooth outline: four rounded corners and a round knob head on a curved neck, no socket', () => {
    const d = pieceCardPath(300, 216, shape);
    expect(d.match(/A/g)).toHaveLength(5);
    expect(d.match(/C/g)).toHaveLength(2);
  });

  it('keeps the knob clear of the corners on narrow cards', () => {
    const d = pieceCardPath(120, 216, { ...shape, knobAt: 0.99 });
    // the knob's shoulders (1.7 × 18 on each side) start after the top-left corner (40) …
    const start = Number(/L(\d+(?:\.\d+)?) [\d.]+ C/.exec(d)?.[1]);
    expect(start).toBeGreaterThanOrEqual(40);
    // … and end before the top-right corner (18)
    const end = Number(/ (\d+(?:\.\d+)?) [\d.]+ L[\d.]+ [\d.]+ A18/.exec(d)?.[1]);
    expect(end).toBeLessThanOrEqual(120 - 18);
    expect(end - start).toBeCloseTo(2 * 1.7 * 18, 0);
  });
});

describe('trail', () => {
  it('places stations one step apart around the middle', () => {
    const pts = trailPoints(10, 100, 50, 150, 20);
    expect(pts).toHaveLength(10);
    expect(pts[9]?.x).toBe(950);
    for (const p of pts) expect(Math.abs(p.y - 150)).toBeLessThanOrEqual(20);
  });

  it('draws one smooth curve per gap', () => {
    const d = trailPath(trailPoints(4, 100, 50, 150, 20));
    expect(d.match(/C/g)).toHaveLength(3);
    expect(trailPath([])).toBe('');
  });
});
