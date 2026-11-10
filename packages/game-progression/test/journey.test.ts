import { describe, expect, it } from 'vitest';

import { WORLDS, findStation, isPlayable, journeyPosition, type World } from '../src/index.ts';

const worlds: World[] = [
  {
    id: 'a',
    stations: [
      { id: 'a1', kind: 'puzzle', picture: 'p', pieces: 4 },
      { id: 'a2', kind: 'puzzle', picture: 'p', pieces: 6 },
    ],
  },
  { id: 'b', stations: [{ id: 'b1', kind: 'puzzle', picture: 'p', pieces: 9 }] },
];

describe('journey', () => {
  it('starts at the first station of the first world', () => {
    expect(journeyPosition(new Set(), worlds)).toMatchObject({ worldIndex: 0, stationIndex: 0, next: { id: 'a1' } });
  });

  it('moves on station by station and into the next world', () => {
    expect(journeyPosition(new Set(['a1']), worlds).next?.id).toBe('a2');
    expect(journeyPosition(new Set(['a1', 'a2']), worlds)).toMatchObject({ worldIndex: 1, next: { id: 'b1' } });
  });

  it('waits at a gap even when later stations were played', () => {
    expect(journeyPosition(new Set(['a2']), worlds).next?.id).toBe('a1');
  });

  it('reports the end of the journey', () => {
    expect(journeyPosition(new Set(['a1', 'a2', 'b1']), worlds)).toMatchObject({
      worldIndex: 1,
      stationIndex: 1,
      next: null,
    });
  });

  it('lets done stations be replayed, the next one played and keeps later ones closed', () => {
    const done = new Set(['a1']);
    expect(isPlayable('a1', done, worlds)).toBe(true);
    expect(isPlayable('a2', done, worlds)).toBe(true);
    expect(isPlayable('b1', done, worlds)).toBe(false);
    expect(findStation('b1', worlds)?.pieces).toBe(9);
    expect(findStation('nope', worlds)).toBeUndefined();
  });

  it('the real journey: unique ids, small puzzles, growing slowly', () => {
    const ids = WORLDS.flatMap((w) => w.stations.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WORLDS) {
      let prev = 0;
      for (const s of w.stations) {
        expect(s.pieces).toBeGreaterThanOrEqual(4);
        expect(s.pieces).toBeLessThanOrEqual(25);
        expect(s.pieces).toBeGreaterThanOrEqual(prev);
        prev = s.pieces;
      }
    }
  });
});
