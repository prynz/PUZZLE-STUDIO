import { describe, expect, it } from 'vitest';

import {
  NAV_BAR_HEIGHT,
  NAV_BUBBLE,
  NAV_BUBBLE_RISE,
  NOTCH_REACH,
  notchedBarPath,
  tabCenter,
} from '../src/components/navShape.ts';

describe('bottom bar notch', () => {
  it('draws a closed bar with the notch around the given centre', () => {
    const p = notchedBarPath(300, NAV_BAR_HEIGHT, 150);
    expect(p.startsWith('M0 0 H106')).toBe(true);
    expect(p).toContain(`150 34`); // deepest point of the notch under the centre
    expect(p.endsWith(`H300 V${NAV_BAR_HEIGHT} H0 Z`)).toBe(true);
  });

  it('places four tabs evenly', () => {
    expect([0, 1, 2, 3].map((i) => tabCenter(400, 4, i))).toEqual([50, 150, 250, 350]);
  });

  it('never reaches the neighbouring tab on a small phone (320 pt wide, 4 tabs)', () => {
    const slot = (320 - 2 * 16) / 4;
    expect(NOTCH_REACH).toBeLessThan(slot);
  });

  it('keeps the bubble inside the dip with a visible ring', () => {
    const bubbleBottom = NAV_BUBBLE - NAV_BUBBLE_RISE; // below the bar top edge
    expect(bubbleBottom).toBeLessThan(34);
    expect(NAV_BUBBLE).toBeGreaterThanOrEqual(56); // child-sized touch target
  });
});
