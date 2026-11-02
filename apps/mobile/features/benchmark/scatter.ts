import { createRandom, type PieceShape, type Rect } from '@puzzle-studio/puzzle-engine';

/**
 * Worst case for the 256-piece performance test: every piece loose, randomly scattered
 * (deterministic per seed). Real games use the tray instead (gameplay-concept.md §8).
 */
export function scatter(pieces: readonly PieceShape[], area: Rect, seed: number): { xs: number[]; ys: number[] } {
  const r = createRandom(seed);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of pieces) {
    xs.push(area.x + r() * Math.max(0, area.w - p.cell.w));
    ys.push(area.y + r() * Math.max(0, area.h - p.cell.h));
  }
  return { xs, ys };
}

/** Average engine hit-test time in microseconds on this device (JS thread, all pieces loose). */
export function measureHitTest(run: (x: number, y: number) => number, area: Rect, samples = 2000): number {
  const r = createRandom(99);
  const t0 = performance.now();
  for (let i = 0; i < samples; i++) run(area.x + r() * area.w, area.y + r() * area.h);
  return ((performance.now() - t0) * 1000) / samples;
}
