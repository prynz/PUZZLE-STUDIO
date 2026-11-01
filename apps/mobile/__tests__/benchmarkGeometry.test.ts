import { generatePieces, hitTest, rng, scatter } from '@/features/benchmark/benchmarkGeometry';

describe('benchmark geometry (throwaway spike)', () => {
  it('is deterministic for the same seed', () => {
    expect(generatePieces(4, 4, 400, 300, 7)).toEqual(generatePieces(4, 4, 400, 300, 7));
    expect(generatePieces(4, 4, 400, 300, 7)).not.toEqual(generatePieces(4, 4, 400, 300, 8));
  });

  it('creates rows × cols pieces with cells tiling the board', () => {
    const pieces = generatePieces(16, 16, 320, 240, 1);
    expect(pieces).toHaveLength(256);
    const area = pieces.reduce((sum, p) => sum + p.cell.w * p.cell.h, 0);
    expect(area).toBeCloseTo(320 * 240, 6);
  });

  it('produces closed SVG paths', () => {
    for (const p of generatePieces(3, 3, 300, 300, 3)) {
      expect(p.d.startsWith('M')).toBe(true);
      expect(p.d.endsWith('Z')).toBe(true);
    }
  });

  it('rng stays in [0, 1)', () => {
    const r = rng(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('scatter keeps pieces inside the area', () => {
    const pieces = generatePieces(4, 4, 200, 200, 1);
    const { xs, ys } = scatter(pieces, { x: 10, y: 20, w: 300, h: 400 }, 9);
    xs.forEach((x) => expect(x).toBeGreaterThanOrEqual(10));
    ys.forEach((y) => expect(y).toBeLessThanOrEqual(20 + 400 - 50));
  });

  it('hitTest returns the topmost piece', () => {
    const xs = [0, 5];
    const ys = [0, 5];
    expect(hitTest(10, 10, xs, ys, [0, 1], 20, 20)).toBe(1);
    expect(hitTest(10, 10, xs, ys, [1, 0], 20, 20)).toBe(0);
    expect(hitTest(500, 500, xs, ys, [0, 1], 20, 20)).toBe(-1);
  });
});
