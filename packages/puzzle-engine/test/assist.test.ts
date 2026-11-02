import { describe, expect, it } from 'vitest';

import { assistFor, MAX_CUSTOM_BASKETS } from '../src/index.ts';

describe('assistFor (play-help profiles, independent of piece count)', () => {
  it('toddler: bites from 25 pieces, no baskets, few pieces, always back to the tray', () => {
    for (const n of [4, 25, 100, 256]) {
      const r = assistFor('toddler', n);
      expect(r.baskets).toEqual([]);
      expect(r.editBaskets).toBe(false);
      expect(r.maxCustomBaskets).toBe(0);
      expect(r.misplaceDefault).toBe('return');
      expect(r.misplaceChangeable).toBe(false);
      expect(r.trayMaxVisible).toBe(4);
      expect(r.hintOfferAfterSec).toBe(20);
      expect(r.bites).toBe(n >= 25);
    }
    expect(assistFor('toddler', 16).trayRows).toBe(0);
    expect(assistFor('toddler', 256).trayRows).toBe(1);
  });

  it('kid / pro: baskets grow with the piece count, "Meine Schale" from 144', () => {
    expect(assistFor('kid', 16).baskets).toEqual([]);
    expect(assistFor('kid', 36).baskets).toEqual(['all', 'edges']);
    expect(assistFor('kid', 100).baskets).toEqual(['all', 'edges', 'corners', 'colors']);
    expect(assistFor('pro', 144).baskets).toContain('custom');
    expect(assistFor('pro', 144).maxCustomBaskets).toBe(MAX_CUSTOM_BASKETS);
    expect(assistFor('kid', 100).maxCustomBaskets).toBe(0);
    expect(assistFor('kid', 16).editBaskets).toBe(false);
    expect(assistFor('kid', 36).editBaskets).toBe(true);
  });

  it('tray rows, snap tolerance, misplace default and hints per profile', () => {
    expect([16, 36, 100].map((n) => assistFor('kid', n).trayRows)).toEqual([0, 1, 2]);
    expect(assistFor('toddler', 9).snapTolerance).toBeGreaterThan(assistFor('kid', 9).snapTolerance);
    expect(assistFor('kid', 9).snapTolerance).toBeGreaterThan(assistFor('pro', 9).snapTolerance);
    expect(assistFor('kid', 9).misplaceDefault).toBe('nudge');
    expect(assistFor('pro', 9).misplaceChangeable).toBe(true);
    expect(assistFor('kid', 9).hintOfferAfterSec).toBe(45);
    expect(assistFor('pro', 9).hintOfferAfterSec).toBeNull();
    expect(assistFor('kid', 256).bites).toBe(false);
    expect(assistFor('pro', 256).trayMaxVisible).toBeNull();
  });
});
