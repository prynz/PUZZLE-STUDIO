import { describe, expect, it } from 'vitest';

import { chooseGrid, createRandom, isValidGrid, PIECE_PRESETS, shuffled } from '../src/index.ts';

describe('chooseGrid', () => {
  it('matches the documented examples', () => {
    expect(chooseGrid(16, 4 / 3)).toEqual({ rows: 4, cols: 4 });
    expect(chooseGrid(16, 16 / 9)).toEqual({ rows: 3, cols: 5 });
    expect(chooseGrid(256, 1)).toEqual({ rows: 16, cols: 16 });
    expect(chooseGrid(4, 3 / 4)).toEqual({ rows: 2, cols: 2 });
  });

  it.each([4 / 3, 1, 3 / 4, 16 / 9, 9 / 16])('gives a valid, close grid for every preset (aspect %f)', (aspect) => {
    for (const n of PIECE_PRESETS) {
      const g = chooseGrid(n, aspect);
      expect(isValidGrid(g)).toBe(true);
      expect(Math.abs(g.rows * g.cols - n) / n).toBeLessThanOrEqual(0.25);
      const pieceAspect = (aspect * g.rows) / g.cols;
      expect(pieceAspect).toBeGreaterThan(0.55);
      expect(pieceAspect).toBeLessThan(1.8);
    }
  });

  it('portrait is the transpose of landscape', () => {
    for (const n of PIECE_PRESETS) {
      const l = chooseGrid(n, 4 / 3);
      const p = chooseGrid(n, 3 / 4);
      expect(l.rows * l.cols).toBe(p.rows * p.cols);
    }
  });

  it('rejects nonsense input', () => {
    expect(() => chooseGrid(0, 1)).toThrow(RangeError);
    expect(() => chooseGrid(16, 0)).toThrow(RangeError);
    expect(() => chooseGrid(Number.NaN, 1)).toThrow(RangeError);
  });

  it('validates manual grids (2…16)', () => {
    expect(isValidGrid({ rows: 2, cols: 16 })).toBe(true);
    expect(isValidGrid({ rows: 1, cols: 4 })).toBe(false);
    expect(isValidGrid({ rows: 17, cols: 4 })).toBe(false);
    expect(isValidGrid({ rows: 2.5, cols: 4 })).toBe(false);
  });
});

describe('random', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = createRandom(7);
    const b = createRandom(7);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('shuffles reproducibly without losing items', () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const s = shuffled(items, 3);
    expect(s).toEqual(shuffled(items, 3));
    expect(s).not.toEqual(items);
    expect([...s].sort((x, y) => x - y)).toEqual(items);
    expect(items[0]).toBe(0); // input untouched
  });
});
