import { describe, expect, it } from 'vitest';

import {
  addCustomBasket,
  createState,
  distanceToTarget,
  dropPiece,
  findFreeSpot,
  isComplete,
  isNearTarget,
  lockedCount,
  loosePieces,
  orderBaskets,
  placeLoose,
  putInBasket,
  removeCustomBasket,
  renameBasket,
  returnToTray,
  setMisplaceMode,
  setReferenceVisible,
  type PuzzleState,
} from '../src/index.ts';
import { puzzle } from './helpers.ts';

const P = puzzle(); // 4 × 4, pieces 300 × 225
const AREA = { x: -400, y: -300, w: 2000, h: 1500 };
const OPTS = { tolerance: 0.26, area: AREA };
const fresh = (mode: 'nudge' | 'return' = 'nudge') => createState(P, { seed: 1, misplaceMode: mode });

describe('createState', () => {
  it('puts every piece in the tray in a seeded order', () => {
    const s = fresh();
    expect(s.pieces.every((p) => p.state === 'tray')).toBe(true);
    expect([...s.trayOrder].sort((a, b) => a - b)).toEqual(P.pieces.map((p) => p.id));
    expect(s.trayOrder).toEqual(fresh().trayOrder);
    expect(createState(P, { seed: 2, misplaceMode: 'nudge' }).trayOrder).not.toEqual(s.trayOrder);
    expect(s.referenceVisible).toBe(true);
    expect(createState(P, { seed: 1, misplaceMode: 'return', referenceVisible: false }).referenceVisible).toBe(false);
  });
});

describe('moving pieces', () => {
  it('placeLoose takes a piece from the tray and puts it on top', () => {
    let s = placeLoose(fresh(), 3, 100, 100);
    s = placeLoose(s, 5, 120, 100);
    s = placeLoose(s, 3, 140, 100); // grab again → back on top
    expect(loosePieces(s)).toEqual([5, 3]);
    expect(s.trayOrder).not.toContain(3);
    expect(s.pieces[3]).toMatchObject({ state: 'loose', x: 140, y: 100 });
  });

  it('returnToTray puts the piece first in the tray', () => {
    const s = returnToTray(placeLoose(fresh(), 7, 0, 0), 7);
    expect(s.trayOrder[0]).toBe(7);
    expect(s.z).toEqual([]);
    expect(s.pieces[7]?.state).toBe('tray');
  });

  it('unknown pieces are rejected', () => {
    expect(() => placeLoose(fresh(), 99, 0, 0)).toThrow(RangeError);
  });
});

describe('snapping & locking (PO: locked pieces stay forever)', () => {
  it('isNearTarget uses a fraction of the smaller piece side', () => {
    expect(distanceToTarget(P, 5, 300 + 30, 225 + 40)).toBe(50);
    expect(isNearTarget(P, 5, 300 + 30, 225 + 40, 0.26)).toBe(true); // 50 ≤ 58.5
    expect(isNearTarget(P, 5, 300 + 60, 225, 0.26)).toBe(false);
    expect(isNearTarget(P, 5, 300 + 60, 225, 0.35)).toBe(true);
  });

  it('dropping near the target locks the piece exactly into its cell', () => {
    const s0 = placeLoose(fresh(), 5, 0, 0);
    const r = dropPiece(P, s0, 5, 310, 240, OPTS);
    expect(r.outcome).toBe('locked');
    expect(r.state.pieces[5]).toEqual({ state: 'locked', x: 300, y: 225 });
    expect(r.state.z).not.toContain(5);
    expect(r.state.moves).toBe(1);
    expect(lockedCount(r.state)).toBe(1);
  });

  it('locked pieces can no longer be moved, returned, dropped or put in a basket', () => {
    const locked = dropPiece(P, placeLoose(fresh(), 5, 0, 0), 5, 300, 225, OPTS).state;
    expect(placeLoose(locked, 5, 900, 900)).toBe(locked);
    expect(returnToTray(locked, 5)).toBe(locked);
    expect(dropPiece(P, locked, 5, 900, 900, OPTS)).toMatchObject({ state: locked, outcome: 'locked' });
    const withBasket = addCustomBasket(locked, 'Boot');
    expect(withBasket).not.toBeNull();
    if (withBasket) expect(putInBasket(withBasket.state, 5, withBasket.id)).toBe(withBasket.state);
  });

  it('a locked piece leaves its custom basket', () => {
    const added = addCustomBasket(fresh(), 'Boot');
    if (!added) throw new Error('basket');
    const s = putInBasket(placeLoose(added.state, 5, 0, 0), 5, added.id);
    expect(s.pieces[5]?.basket).toBe(added.id);
    expect(dropPiece(P, s, 5, 300, 225, OPTS).state.pieces[5]).toEqual({ state: 'locked', x: 300, y: 225 });
  });

  it('completes when every piece is locked', () => {
    let s: PuzzleState = fresh();
    for (const p of P.pieces) s = dropPiece(P, placeLoose(s, p.id, 0, 0), p.id, p.cell.x, p.cell.y, OPTS).state;
    expect(isComplete(s)).toBe(true);
    expect(s.trayOrder).toEqual([]);
    expect(s.moves).toBe(16);
  });
});

describe('misplaced pieces (PO decision: stay loose and glide aside, or back to the tray)', () => {
  it('nudge: a free drop position is kept ("stayed")', () => {
    const r = dropPiece(P, placeLoose(fresh(), 0, 0, 0), 0, 900, 700, OPTS);
    expect(r).toMatchObject({ outcome: 'stayed', x: 900, y: 700 });
    expect(r.state.pieces[0]?.state).toBe('loose');
  });

  it('nudge: dropped onto another piece → glides to the nearest free spot without overlap', () => {
    let s = placeLoose(fresh(), 1, 900, 600);
    s = placeLoose(s, 0, 0, 0);
    const r = dropPiece(P, s, 0, 910, 610, OPTS);
    expect(r.outcome).toBe('nudged');
    const dx = Math.abs(r.x - 900);
    const dy = Math.abs(r.y - 600);
    expect(dx >= 300 || dy >= 225).toBe(true); // no overlap with piece 1
    expect(Math.hypot(r.x - 910, r.y - 610)).toBeLessThan(400); // stays nearby
    expect(r).toEqual(dropPiece(P, s, 0, 910, 610, OPTS)); // deterministic
  });

  it('nudge: never lands on locked pieces', () => {
    let s: PuzzleState = fresh();
    for (const id of [5, 6, 9, 10]) s = dropPiece(P, placeLoose(s, id, 0, 0), id, ...cellOf(id), OPTS).state;
    s = placeLoose(s, 0, 0, 0);
    const r = dropPiece(P, s, 0, 450, 340, OPTS); // middle of the locked block
    expect(r.outcome).toBe('nudged');
    for (const id of [5, 6, 9, 10]) {
      const [cx, cy] = cellOf(id);
      expect(r.x >= cx + 300 || r.x + 300 <= cx || r.y >= cy + 225 || r.y + 225 <= cy).toBe(true);
    }
  });

  it('nudge: no free spot → back to the tray', () => {
    const tiny = { tolerance: 0.26, area: { x: 0, y: 0, w: 320, h: 240 } };
    let s = placeLoose(fresh(), 1, 0, 0);
    s = placeLoose(s, 2, 600, 600);
    const r = dropPiece(P, s, 2, 10, 10, tiny); // piece 1 fills the whole (tiny) area
    expect(r.outcome).toBe('returned');
    expect(r.state.trayOrder[0]).toBe(2);
  });

  it('return mode: misplaced pieces float back to the tray', () => {
    const r = dropPiece(P, placeLoose(fresh('return'), 0, 0, 0), 0, 900, 700, OPTS);
    expect(r.outcome).toBe('returned');
    expect(r.state.pieces[0]?.state).toBe('tray');
    expect(setMisplaceMode(r.state, 'nudge').misplaceMode).toBe('nudge');
  });

  it('findFreeSpot skips the piece’s own target (it would look placed but is not)', () => {
    const spot = findFreeSpot(P, fresh(), 5, 310, 230, { area: AREA, tolerance: 0.26 });
    expect(spot).not.toBeNull();
    if (spot) expect(isNearTarget(P, 5, spot.x, spot.y, 0.26)).toBe(false);
  });
});

function cellOf(id: number): [number, number] {
  const c = P.pieces[id]?.cell;
  if (!c) throw new Error('cell');
  return [c.x, c.y];
}

describe('baskets (rename, reorder, up to 3 custom baskets)', () => {
  it('renames and restores suggested names', () => {
    let s = renameBasket(fresh(), 'color-0', '  Himmel und Meer  ');
    expect(s.baskets).toEqual([{ id: 'color-0', label: 'Himmel und Meer', order: 0 }]);
    s = renameBasket(s, 'color-0', 'x'.repeat(40));
    expect(s.baskets[0]?.label).toHaveLength(24);
    s = renameBasket(s, 'color-0', '   ');
    expect(s.baskets).toEqual([{ id: 'color-0', order: 0 }]);
  });

  it('reorders baskets', () => {
    let s = renameBasket(fresh(), 'edges', 'Rand');
    s = renameBasket(s, 'zzz', 'weg');
    s = orderBaskets(s, ['corners', 'edges']);
    expect(s.baskets).toEqual([
      { id: 'corners', order: 0 },
      { id: 'edges', label: 'Rand', order: 1 },
      { id: 'zzz', label: 'weg', order: 2 },
    ]);
  });

  it('allows at most three custom baskets and cleans up when one is removed', () => {
    let s: PuzzleState = fresh();
    const ids: string[] = [];
    for (const label of ['Boot', '', 'Sonne']) {
      const r = addCustomBasket(s, label);
      if (!r) throw new Error('limit too early');
      s = r.state;
      ids.push(r.id);
    }
    expect(ids).toEqual(['mine-1', 'mine-2', 'mine-3']);
    expect(addCustomBasket(s, 'zu viel')).toBeNull();
    s = putInBasket(s, 4, 'mine-2');
    s = removeCustomBasket(s, 'mine-2');
    expect(s.pieces[4]?.basket).toBeUndefined();
    expect(removeCustomBasket(s, 'edges')).toBe(s);
    expect(addCustomBasket(s, 'neu')?.id).toBe('mine-2');
    expect(() => putInBasket(s, 4, 'nope')).toThrow(RangeError);
    s = putInBasket(s, 4, 'mine-1');
    expect(putInBasket(s, 4, null).pieces[4]?.basket).toBeUndefined();
  });

  it('reference toggle', () => {
    expect(setReferenceVisible(fresh(), false).referenceVisible).toBe(false);
  });
});
