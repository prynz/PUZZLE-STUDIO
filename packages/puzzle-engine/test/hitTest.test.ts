import { describe, expect, it } from 'vitest';

import { buildHitGrid, hitShapesFor, hitTest, pieceAt, pointInPolygon } from '../src/index.ts';
import { puzzle } from './helpers.ts';

const AREA = { x: -600, y: -450, w: 2400, h: 1800 };

function setup(over = {}) {
  const p = puzzle(over);
  const shapes = hitShapesFor(p);
  const xs = p.pieces.map((x) => x.cell.x);
  const ys = p.pieces.map((x) => x.cell.y);
  const rank = p.pieces.map((x) => x.id);
  return { p, shapes, xs, ys, rank };
}

describe('pointInPolygon', () => {
  const square = [0, 0, 10, 0, 10, 10, 0, 10];
  it('detects inside / outside', () => {
    expect(pointInPolygon(5, 5, square)).toBe(true);
    expect(pointInPolygon(15, 5, square)).toBe(false);
    expect(pointInPolygon(-1, -1, square)).toBe(false);
  });
});

describe('hitTest', () => {
  it('finds each piece at its cell centre (home positions)', () => {
    const { p, shapes, xs, ys, rank } = setup();
    const grid = buildHitGrid(shapes, xs, ys, rank, AREA, 150);
    for (const x of p.pieces) {
      expect(hitTest(x.cell.x + x.cell.w / 2, x.cell.y + x.cell.h / 2, grid, shapes, xs, ys, rank)).toBe(x.id);
    }
  });

  it('uses the exact outline: a tab belongs to its piece, a blank does not', () => {
    const { p, shapes, xs, ys, rank } = setup({ rows: 3, cols: 3 });
    const grid = buildHitGrid(shapes, xs, ys, rank, AREA, 150);
    const centre = pieceAt(p, 4); // inner piece
    const midY = centre.cell.y + centre.cell.h / 2;
    // just outside the right cell border, half a tab deep
    const probeX = centre.cell.x + centre.cell.w + 0.06 * Math.min(p.pieceWidth, p.pieceHeight);
    const hit = hitTest(probeX, midY, grid, shapes, xs, ys, rank);
    expect(hit).toBe(centre.edges.right === 1 ? 4 : 5);
  });

  it('returns the TOP piece when pieces overlap, and follows moved pieces', () => {
    const { shapes, xs, ys, rank } = setup();
    xs[0] = 600;
    ys[0] = 450; // piece 0 dropped onto piece 10 (cell 600/450)
    const ranks = rank.slice();
    ranks[0] = 100;
    const grid = buildHitGrid(
      shapes,
      xs,
      ys,
      ranks.map((_, i) => i),
      AREA,
      150,
    );
    expect(hitTest(650, 500, grid, shapes, xs, ys, ranks)).toBe(0);
    ranks[0] = -1; // below everything
    expect(hitTest(650, 500, grid, shapes, xs, ys, ranks)).toBe(10);
  });

  it('only indexes the given (loose) pieces – locked/tray pieces cannot be grabbed', () => {
    const { shapes, xs, ys, rank } = setup();
    const grid = buildHitGrid(shapes, xs, ys, [3], AREA, 150);
    expect(hitTest(150, 110, grid, shapes, xs, ys, rank)).toBe(-1); // piece 0 not loose
    expect(hitTest(1050, 110, grid, shapes, xs, ys, rank)).toBe(3);
  });

  it('works for pieces and touches outside the indexed area (clamped buckets)', () => {
    const { shapes, xs, ys, rank } = setup();
    xs[5] = -2000;
    ys[5] = 5000;
    const grid = buildHitGrid(shapes, xs, ys, [5], { x: 0, y: 0, w: 1200, h: 900 }, 150);
    expect(hitTest(-2000 + 150, 5000 + 110, grid, shapes, xs, ys, rank)).toBe(5);
    expect(hitTest(-9999, -9999, grid, shapes, xs, ys, rank)).toBe(-1);
  });

  it('is fast enough for 256 pieces (budget 0.5 ms per touch on devices)', () => {
    const { p, shapes, xs, ys, rank } = setup({ rows: 16, cols: 16 });
    const grid = buildHitGrid(shapes, xs, ys, rank, AREA, p.pieceWidth);
    const t0 = performance.now();
    const N = 20000;
    let found = 0;
    for (let i = 0; i < N; i++) {
      if (hitTest((i * 37) % 1200, (i * 53) % 900, grid, shapes, xs, ys, rank) >= 0) found++;
    }
    const perTouch = (performance.now() - t0) / N;
    expect(found).toBeGreaterThan(N * 0.9);
    expect(perTouch).toBeLessThan(0.05); // Node is ~10× faster than a mid-range phone → keep 10× headroom
  });
});
