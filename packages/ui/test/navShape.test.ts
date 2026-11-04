import { describe, expect, it } from 'vitest';

import {
  NAV_BAR_HEIGHT,
  NAV_BUBBLE,
  NAV_BUBBLE_RISE,
  NAV_CORNER,
  NOTCH_REACH,
  navInset,
  notchedBarPath,
  tabCenter,
} from '../src/components/navShape.ts';

const PHONES = [304, 358, 398]; // bar width on 320 (8 pt margins) / 390 / 430 pt phones

describe('bottom bar notch', () => {
  it('draws one closed outline: rounded corners plus the notch around the centre', () => {
    const p = notchedBarPath(300, NAV_BAR_HEIGHT, 150);
    expect(p.startsWith(`M${NAV_CORNER} 0 H${150 - NOTCH_REACH}`)).toBe(true);
    expect(p).toContain('150 34'); // deepest point under the centre
    expect(p.match(/A/g)).toHaveLength(4); // four rounded corners
    expect(p.endsWith('Z')).toBe(true);
  });

  it.each(PHONES)('keeps bar visible between corner and the notch of the edge tabs (%i pt)', (w) => {
    const first = tabCenter(w, 4, 0);
    const last = tabCenter(w, 4, 3);
    expect(first - NOTCH_REACH).toBeGreaterThanOrEqual(NAV_CORNER + 8 - 1e-9);
    expect(w - (last + NOTCH_REACH)).toBeGreaterThanOrEqual(NAV_CORNER + 8 - 1e-9);
  });

  it.each(PHONES)('spaces the tabs evenly and keeps child-sized touch areas (%i pt)', (w) => {
    const c = [0, 1, 2, 3].map((i) => tabCenter(w, 4, i));
    const step = (c[1] ?? 0) - (c[0] ?? 0);
    expect((c[3] ?? 0) - (c[2] ?? 0)).toBeCloseTo(step);
    expect(step).toBeGreaterThanOrEqual(56 - 1e-9); // middle tabs; edge tabs reach to the bar edge
    expect((c[0] ?? 0) + step / 2).toBeGreaterThanOrEqual(56);
  });

  it('needs no inset on wide bars', () => {
    expect(navInset(800, 4)).toBe(0);
  });

  it('keeps the bubble inside the dip with a visible ring', () => {
    expect(NAV_BUBBLE - NAV_BUBBLE_RISE).toBeLessThan(34);
    expect(NAV_BUBBLE).toBeGreaterThanOrEqual(56);
  });
});
