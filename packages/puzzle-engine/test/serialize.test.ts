import { describe, expect, it } from 'vitest';

import {
  addCustomBasket,
  createState,
  dropPiece,
  migrateState,
  parseState,
  placeLoose,
  putInBasket,
  renameBasket,
  serializeState,
  type PuzzleState,
  type PuzzleStateV1,
} from '../src/index.ts';
import { puzzle } from './helpers.ts';

const P = puzzle();
const OPTS = { tolerance: 0.26, area: { x: -400, y: -300, w: 2000, h: 1500 } };

function played(): PuzzleState {
  let s = createState(P, { seed: 9, misplaceMode: 'nudge' });
  s = dropPiece(P, placeLoose(s, 5, 0, 0), 5, 300, 225, OPTS).state; // locked
  s = placeLoose(s, 2, 1300.5, -120.25); // loose, next to the board
  s = placeLoose(s, 7, 40, 60);
  const b = addCustomBasket(s, 'Boot');
  if (!b) throw new Error('basket');
  s = putInBasket(b.state, 9, b.id);
  s = renameBasket(s, 'edges', 'Rand');
  return s;
}

const doc = (s: PuzzleState) => JSON.parse(serializeState(P, s)) as PuzzleStateV1;
const withDoc = (mutate: (d: PuzzleStateV1) => void) => {
  const d = doc(played());
  mutate(d);
  return parseState(P, JSON.stringify(d));
};

describe('serialization', () => {
  it('round-trips the state', () => {
    const s = played();
    const r = parseState(P, serializeState(P, s));
    if (!r.ok) throw new Error(r.reason);
    const { pieces, ...rest } = r.state;
    const { pieces: expected, ...expectedRest } = s;
    expect(rest).toEqual(expectedRest);
    pieces.forEach((p, i) => {
      const e = expected[i];
      expect(p.state).toBe(e?.state);
      expect(p.basket).toBe(e?.basket);
      expect(p.x).toBeCloseTo(e?.x ?? NaN, 9);
      expect(p.y).toBeCloseTo(e?.y ?? NaN, 9);
    });
  });

  it('stores positions relative to the board size (device independent)', () => {
    const d = doc(played());
    expect(d.v).toBe(1);
    expect(d.pieces[2]).toMatchObject({ x: 1300.5 / 1200, y: -120.25 / 900, state: 'loose' });
    expect(d.pieces[9]).toMatchObject({ basket: 'mine-1', state: 'tray' });
    expect(d.pieces[0]).not.toHaveProperty('basket');
  });

  it('locked pieces are restored exactly in their cell, whatever was stored', () => {
    const r = withDoc((d) => {
      const p = d.pieces[5];
      if (p) {
        p.x = 0.9;
        p.y = 0.9;
        p.basket = 'mine-1';
      }
    });
    expect(r.ok && r.state.pieces[5]).toEqual({ state: 'locked', x: 300, y: 225 });
  });

  it.each<[string, (d: PuzzleStateV1) => void]>([
    ['piece count', (d) => d.pieces.pop()],
    ['duplicate id', (d) => ((d.pieces[1] as { id: number }).id = 0)],
    ['bad state', (d) => ((d.pieces[1] as { state: string }).state = 'flying')],
    ['position out of range', (d) => ((d.pieces[1] as { x: number }).x = 1e9)],
    ['NaN position', (d) => ((d.pieces[1] as { x: unknown }).x = 'NaN')],
    ['unknown basket', (d) => ((d.pieces[1] as { basket?: string }).basket = 'mine-9')],
    ['z misses a loose piece', (d) => d.z.pop()],
    ['tray order duplicate', (d) => d.trayOrder.push(d.trayOrder[0] ?? 0)],
    ['misplace mode', (d) => ((d as { misplaceMode: string }).misplaceMode = 'explode')],
    ['moves', (d) => (d.moves = -1)],
    ['reference flag', (d) => ((d as { referenceVisible: unknown }).referenceVisible = 'yes')],
    ['baskets not a list', (d) => ((d as { baskets: unknown }).baskets = {})],
    ['basket label too long', (d) => d.baskets.push({ id: 'x', order: 5, label: 'y'.repeat(30) })],
    ['basket duplicate id', (d) => d.baskets.push({ id: 'edges', order: 9 })],
    ['basket custom flag', (d) => d.baskets.push({ id: 'q', order: 9, custom: false as unknown as true })],
    [
      'too many custom baskets',
      (d) => ['a', 'b', 'c'].forEach((id, i) => d.baskets.push({ id, order: 10 + i, custom: true })),
    ],
  ])('rejects invalid data instead of crashing: %s', (_, mutate) => {
    const r = withDoc(mutate);
    expect(r.ok).toBe(false);
  });

  it('rejects broken JSON, non-objects and unknown versions', () => {
    expect(parseState(P, '{nope')).toEqual({ ok: false, reason: 'invalid JSON' });
    expect(parseState(P, '[1,2]').ok).toBe(false);
    expect(parseState(P, JSON.stringify({ ...doc(played()), v: 2 }))).toEqual({
      ok: false,
      reason: 'unsupported state version 2',
    });
  });

  it('migrateState accepts the current version unchanged', () => {
    const d = doc(played());
    expect(migrateState(d)).toEqual({ ok: true, doc: d });
    expect(migrateState(null).ok).toBe(false);
  });
});
