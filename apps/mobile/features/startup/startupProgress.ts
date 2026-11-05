/**
 * App-start preloader timing (docs/product/startup.md): the screen stays at least MIN_MS so the
 * start feels calm and complete, and longer if loading really takes longer.
 * The shown progress never claims more than is really done – it only fills evenly over MIN_MS.
 */
export const STARTUP_MIN_MS = 4500;

export function shownProgress(doneShare: number, elapsedMs: number, minMs = STARTUP_MIN_MS): number {
  const real = Math.max(0, Math.min(1, doneShare));
  const time = Math.max(0, Math.min(1, elapsedMs / minMs));
  return Math.min(real, time);
}

export function startupFinished(doneShare: number, elapsedMs: number, minMs = STARTUP_MIN_MS): boolean {
  return doneShare >= 1 && elapsedMs >= minMs;
}
