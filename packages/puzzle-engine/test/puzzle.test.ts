import { describe, expect, it } from 'vitest';

import { fitBoard, generatePuzzle, pieceAt, tabReach, toSvgPath } from '../src/index.ts';
import { def, polygonArea, puzzle } from './helpers.ts';

describe('generatePuzzle', () => {
  it('is deterministic: same definition → identical geometry', () => {
    expect(puzzle()).toEqual(puzzle());
    expect(puzzle({ seed: 43 }).pieces).not.toEqual(puzzle().pieces);
  });

  it('creates rows × cols pieces with ids row * cols + col', () => {
    const p = puzzle({ rows: 3, cols: 5 });
    expect(p.pieces).toHaveLength(15);
    p.pieces.forEach((piece, i) => {
      expect(piece.id).toBe(i);
      expect(piece.id).toBe(piece.row * 5 + piece.col);
    });
  });

  it('cells tile the image exactly', () => {
    const p = puzzle({ rows: 7, cols: 9 });
    const area = p.pieces.reduce((s, x) => s + x.cell.w * x.cell.h, 0);
    expect(area).toBeCloseTo(1200 * 900, 6);
  });

  it.each(['classic', 'square'] as const)(
    'outline areas sum to the image area (%s) – no gaps, no overlaps',
    (shape) => {
      for (const [rows, cols] of [
        [2, 2],
        [4, 4],
        [9, 12],
        [16, 16],
      ] as const) {
        const p = puzzle({ rows, cols, shape });
        const sum = p.pieces.reduce((s, x) => s + polygonArea(x.outline), 0);
        expect(sum).toBeCloseTo(1200 * 900, 3);
        p.pieces.forEach((x) => expect(polygonArea(x.outline)).toBeGreaterThan(0)); // clockwise in screen space
      }
    },
  );

  it('neighbours share the exact same edge points (forward vs. backward)', () => {
    const p = puzzle({ rows: 5, cols: 6 });
    const cols = 6;
    const pointsOf = (outline: number[]) => {
      const pts: string[] = [];
      for (let i = 0; i < outline.length; i += 2) pts.push(`${outline[i]},${outline[i + 1]}`);
      return pts;
    };
    for (const a of p.pieces) {
      if (a.col < cols - 1) {
        const b = pieceAt(p, a.id + 1);
        const shared = pointsOf(a.outline).filter((pt) => pointsOf(b.outline).includes(pt));
        expect(shared.length).toBeGreaterThanOrEqual(a.edges.right === 0 ? 2 : 24);
        expect(a.edges.right).toBe(-b.edges.left as typeof a.edges.right);
      }
      if (a.row < 4) {
        const b = pieceAt(p, a.id + cols);
        expect(a.edges.bottom).toBe(-b.edges.top as typeof a.edges.bottom);
      }
    }
  });

  it('border edges are flat, inner edges have tabs or blanks', () => {
    const p = puzzle({ rows: 4, cols: 4 });
    for (const x of p.pieces) {
      expect(x.edges.top === 0).toBe(x.row === 0);
      expect(x.edges.bottom === 0).toBe(x.row === 3);
      expect(x.edges.left === 0).toBe(x.col === 0);
      expect(x.edges.right === 0).toBe(x.col === 3);
    }
  });

  it('square style: all edges straight, 4-point outlines, bounds = cell', () => {
    const p = puzzle({ shape: 'square' });
    expect(tabReach(p)).toBe(0);
    for (const x of p.pieces) {
      expect(x.edges).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(x.outline).toHaveLength(8);
      expect(x.bounds).toEqual(x.cell);
      expect(x.path.filter((c) => c.op === 'C')).toHaveLength(0);
    }
  });

  it('classifies corners, edges and inner pieces from the grid position', () => {
    for (const shape of ['classic', 'square'] as const) {
      const p = puzzle({ rows: 4, cols: 5, shape });
      const count = (k: string) => p.pieces.filter((x) => x.kind === k).length;
      expect(count('corner')).toBe(4);
      expect(count('edge')).toBe(2 * (4 - 2) + 2 * (5 - 2));
      expect(count('inner')).toBe(2 * 3);
    }
  });

  it('tabs stay within 25 % of the smaller piece side and inside the bounds', () => {
    const p = puzzle({ rows: 6, cols: 8 });
    const reach = tabReach(p);
    expect(reach).toBeLessThanOrEqual(0.25 * Math.min(p.pieceWidth, p.pieceHeight) + 1e-9);
    for (const x of p.pieces) {
      expect(x.bounds.x).toBeGreaterThanOrEqual(x.cell.x - reach - 1e-9);
      expect(x.bounds.y).toBeGreaterThanOrEqual(x.cell.y - reach - 1e-9);
      expect(x.bounds.x + x.bounds.w).toBeLessThanOrEqual(x.cell.x + x.cell.w + reach + 1e-9);
      expect(x.bounds.y + x.bounds.h).toBeLessThanOrEqual(x.cell.y + x.cell.h + reach + 1e-9);
      for (let i = 0; i < x.outline.length; i += 2) {
        expect(x.outline[i]).toBeGreaterThanOrEqual(x.bounds.x - 1e-9);
        expect(x.outline[i + 1]).toBeGreaterThanOrEqual(x.bounds.y - 1e-9);
      }
    }
  });

  it('paths are closed, start with M and are valid SVG', () => {
    const p = puzzle({ rows: 3, cols: 3 });
    for (const x of p.pieces) {
      expect(x.path[0]?.op).toBe('M');
      expect(x.path.at(-1)?.op).toBe('Z');
      const svg = toSvgPath(x.path);
      expect(svg).toMatch(/^M[\d.]+ [\d.]+ /);
      expect(svg.endsWith('Z')).toBe(true);
    }
    expect(toSvgPath([{ op: 'M', x: 1, y: 2 }, { op: 'L', x: 3.456, y: 4 }, { op: 'Z' }], 10, 20)).toBe(
      'M11 22 L13.46 24 Z',
    );
  });

  it('rejects invalid definitions', () => {
    expect(() => generatePuzzle(def({ engineVersion: 99 }))).toThrow(/engine version/);
    expect(() => generatePuzzle(def({ rows: 1 }))).toThrow(RangeError);
    expect(() => generatePuzzle(def({ width: 0 }))).toThrow(RangeError);
    expect(() => pieceAt(puzzle(), 99)).toThrow(RangeError);
  });

  it('fitBoard letterboxes the image into an area', () => {
    const p = puzzle();
    expect(fitBoard(p, { x: 0, y: 0, w: 600, h: 600 })).toEqual({ scale: 0.5, x: 0, y: 75 });
    expect(fitBoard(p, { x: 10, y: 0, w: 2000, h: 450 })).toEqual({ scale: 0.5, x: 10 + (2000 - 600) / 2, y: 0 });
  });
});
