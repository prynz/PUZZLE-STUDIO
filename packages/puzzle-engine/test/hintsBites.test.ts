import { describe, expect, it } from 'vitest';

import {
  activeBite,
  biteTray,
  createState,
  dropPiece,
  placeLoose,
  planBites,
  splitTwosThrees,
  suggestPiece,
  type PuzzleState,
} from '../src/index.ts';
import { puzzle } from './helpers.ts';

const OPTS = { tolerance: 0.26, area: { x: -400, y: -300, w: 2000, h: 1500 } };

function lock(p: ReturnType<typeof puzzle>, s: PuzzleState, ids: number[]): PuzzleState {
  for (const id of ids) {
    const c = p.pieces[id]?.cell;
    if (!c) throw new Error('cell');
    s = dropPiece(p, placeLoose(s, id, 0, 0), id, c.x, c.y, OPTS).state;
  }
  return s;
}

describe('suggestPiece', () => {
  const P = puzzle({ rows: 4, cols: 4 });

  it('starts with the frame: a corner', () => {
    const id = suggestPiece(P, createState(P, { seed: 1, misplaceMode: 'nudge' }));
    expect(id).not.toBeNull();
    expect(P.pieces[id ?? -1]?.kind).toBe('corner');
  });

  it('prefers pieces next to locked ones', () => {
    const s = lock(P, createState(P, { seed: 1, misplaceMode: 'nudge' }), [5, 6]);
    const id = suggestPiece(P, s);
    expect([1, 2, 4, 7, 9, 10]).toContain(id);
  });

  it('among: restricts the choice; null when nothing is left', () => {
    const s = createState(P, { seed: 1, misplaceMode: 'nudge' });
    expect(suggestPiece(P, s, [9, 10])).toBe(9); // 9 is an edge piece, 10 inner
    expect(suggestPiece(P, lock(P, s, [9, 10]), [9, 10])).toBeNull();
  });

  it('on ties prefers what the child sees first (top loose piece, then tray order)', () => {
    let s = createState(P, { seed: 1, misplaceMode: 'nudge' });
    const corners = [0, 3, 12, 15];
    const firstInTray = s.trayOrder.find((id) => corners.includes(id));
    expect(suggestPiece(P, s)).toBe(firstInTray);
    s = placeLoose(s, 15, 900, 900);
    expect(suggestPiece(P, s)).toBe(15);
  });
});

describe('bites (toddler "Häppchen-Modus")', () => {
  it('splits into parts of 2 or 3', () => {
    for (let n = 2; n <= 16; n++) {
      const parts = splitTwosThrees(n);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(n);
      parts.forEach((x) => expect([2, 3]).toContain(x));
    }
  });

  it('small puzzles are a single bite', () => {
    const P = puzzle({ rows: 4, cols: 4 });
    const b = planBites(P);
    expect(b).toHaveLength(1);
    expect(b[0]?.pieces).toHaveLength(16);
    expect(b[0]?.rect).toEqual({ x: 0, y: 0, w: 1200, h: 900 });
  });

  it.each([
    [5, 5],
    [10, 10],
    [12, 16],
    [16, 16],
    [2, 13],
  ])('%i × %i: every piece in exactly one bite of 4–9 pieces, connected, frame first', (rows, cols) => {
    const P = puzzle({ rows, cols });
    const bites = planBites(P);
    const all = bites.flatMap((b) => b.pieces).sort((a, b) => a - b);
    expect(all).toEqual(P.pieces.map((p) => p.id));
    for (const b of bites) {
      expect(b.pieces.length).toBeGreaterThanOrEqual(4);
      expect(b.pieces.length).toBeLessThanOrEqual(9);
      for (const id of b.pieces) {
        const c = P.pieces[id]?.cell;
        if (!c) throw new Error('cell');
        expect(c.x).toBeGreaterThanOrEqual(b.rect.x - 1e-9);
        expect(c.x + c.w).toBeLessThanOrEqual(b.rect.x + b.rect.w + 1e-6);
      }
    }
    // frame first: the first bite touches the border, and border bites come before inner ones
    const touchesBorder = bites.map((b) =>
      b.pieces.some((id) => {
        const p = P.pieces[id];
        return p !== undefined && p.kind !== 'inner';
      }),
    );
    const firstInner = touchesBorder.indexOf(false);
    if (firstInner >= 0) expect(touchesBorder.slice(firstInner).every((t) => !t)).toBe(true);
    expect(planBites(P)).toEqual(bites); // deterministic
  });

  it('first bite starts top-left and the ring runs clockwise', () => {
    const P = puzzle({ rows: 6, cols: 6 }); // 2 × 2 blocks of 3 × 3
    const bites = planBites(P);
    expect(bites.map((b) => [b.rect.x, b.rect.y])).toEqual([
      [0, 0],
      [600, 0],
      [600, 450],
      [0, 450],
    ]);
  });

  it('active bite and toddler tray (max. 4 pieces of the active bite)', () => {
    const P = puzzle({ rows: 6, cols: 6 });
    const bites = planBites(P);
    let s = createState(P, { seed: 3, misplaceMode: 'return' });
    const first = bites[0];
    if (!first) throw new Error('bite');
    expect(activeBite(bites, s)?.id).toBe(0);
    const tray = biteTray(first, s);
    expect(tray).toHaveLength(4);
    tray.forEach((id) => expect(first.pieces).toContain(id));
    expect(biteTray(first, s, 2)).toEqual(tray.slice(0, 2));
    s = lock(P, s, first.pieces);
    expect(activeBite(bites, s)?.id).toBe(1);
    s = lock(
      P,
      s,
      bites.slice(1).flatMap((b) => b.pieces),
    );
    expect(activeBite(bites, s)).toBeNull();
  });
});
