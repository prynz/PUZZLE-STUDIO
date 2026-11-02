import { ENGINE_VERSION, generatePuzzle, type PuzzleDefinition } from '../src/index.ts';

export const def = (over: Partial<PuzzleDefinition> = {}): PuzzleDefinition => ({
  engineVersion: ENGINE_VERSION,
  seed: 42,
  rows: 4,
  cols: 4,
  shape: 'classic',
  width: 1200,
  height: 900,
  ...over,
});

export const puzzle = (over: Partial<PuzzleDefinition> = {}) => generatePuzzle(def(over));

/** Shoelace area of a flat polygon. */
export function polygonArea(poly: readonly number[]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i += 2) {
    const j = (i + 2) % poly.length;
    a += (poly[i] as number) * (poly[j + 1] as number) - (poly[j] as number) * (poly[i + 1] as number);
  }
  return a / 2;
}
