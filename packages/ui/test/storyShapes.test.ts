import { describe, expect, it } from 'vitest';

import { knobHeight, pieceCardPath, trailPath, trailPoints } from '../src/components/storyShapes.ts';

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('pieceCardPath', () => {
  const shape = { radius: 32, knobRadius: 20, knobAt: 0.74, socketRadius: 16 };

  it('is a closed outline inside the box', () => {
    const d = pieceCardPath(300, 216, shape);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    // coordinates, radii and arc flags – none leaves the 300 × 216 box (the knob reaches y = 0)
    for (const n of numbers(d)) expect(n).toBeGreaterThanOrEqual(0);
    for (const n of numbers(d)) expect(n).toBeLessThanOrEqual(300);
    expect(knobHeight(20)).toBeGreaterThan(20 * 2 * 0.9); // knob is roughly a full circle high
  });

  it('leaves out the socket when its radius is 0', () => {
    expect(pieceCardPath(300, 216, { ...shape, socketRadius: 0 }).match(/A/g)).toHaveLength(5);
    expect(pieceCardPath(300, 216, shape).match(/A/g)).toHaveLength(6);
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
