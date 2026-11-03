import type { Completion } from '@puzzle-studio/game-progression';

export interface ProgressSnapshot {
  completions: Completion[];
  /** achievement id → unlocked at */
  unlocked: Record<string, number>;
}

export interface ProgressStore {
  load(): Promise<ProgressSnapshot>;
  /** Appends one completion and the given new unlocks atomically. */
  record(completion: Completion, newUnlocks: readonly string[]): Promise<void>;
}
