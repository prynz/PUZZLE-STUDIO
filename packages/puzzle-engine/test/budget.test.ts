import { describe, expect, it } from 'vitest';

import { createState, generatePuzzle, parseState, placeLoose, serializeState } from '../src/index.ts';
import { def } from './helpers.ts';

/**
 * Performance budgets (docs/development/testing.md): devices are roughly 10× slower than Node,
 * so the Node budget is a tenth of the device budget. Measured as the best of several runs
 * to ignore one-off CI hiccups.
 */
const best = (runs: number, fn: () => void) => {
  let min = Infinity;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn();
    min = Math.min(min, performance.now() - t0);
  }
  return min;
};

describe('performance budget – 256 pieces', () => {
  const definition = def({ rows: 16, cols: 16, seed: 42 });

  it('generates the puzzle in < 30 ms (device budget 300 ms)', () => {
    expect(best(5, () => generatePuzzle(definition))).toBeLessThan(30);
  });

  it('saves and restores a game in < 10 ms (device budget 100 ms, autosave runs while playing)', () => {
    const p = generatePuzzle(definition);
    let s = createState(p, { seed: 1, misplaceMode: 'nudge', referenceVisible: true });
    for (let id = 0; id < 128; id++) s = placeLoose(s, id, (id * 37) % 1200, (id * 53) % 900);
    const ms = best(5, () => {
      const json = serializeState(p, s);
      const back = parseState(p, json);
      if (!back.ok) throw new Error('restore failed');
    });
    expect(ms).toBeLessThan(10);
  });
});
