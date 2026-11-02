import { ENGINE_VERSION, generatePuzzle } from '@puzzle-studio/puzzle-engine';

import { measureHitTest, scatter } from '@/features/benchmark/scatter';

const puzzle = generatePuzzle({
  engineVersion: ENGINE_VERSION,
  seed: 7,
  rows: 4,
  cols: 4,
  shape: 'classic',
  width: 200,
  height: 200,
});

describe('256-piece test helpers', () => {
  it('scatter is deterministic and keeps pieces inside the area', () => {
    const area = { x: 10, y: 20, w: 300, h: 400 };
    const a = scatter(puzzle.pieces, area, 9);
    expect(a).toEqual(scatter(puzzle.pieces, area, 9));
    a.xs.forEach((x) => expect(x).toBeGreaterThanOrEqual(10));
    a.xs.forEach((x) => expect(x).toBeLessThanOrEqual(10 + 300 - 50));
    a.ys.forEach((y) => expect(y).toBeLessThanOrEqual(20 + 400 - 50));
  });

  it('measureHitTest calls the hit-test for every sample and returns µs', () => {
    const calls: number[] = [];
    const us = measureHitTest((x) => calls.push(x), { x: 0, y: 0, w: 10, h: 10 }, 50);
    expect(calls).toHaveLength(50);
    expect(us).toBeGreaterThanOrEqual(0);
  });
});
