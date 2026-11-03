import type { ProgressSnapshot, ProgressStore } from './types';

/** In-memory store: tests and the web preview. */
export function createMemoryProgressStore(initial?: ProgressSnapshot): ProgressStore {
  const data: ProgressSnapshot = {
    completions: [...(initial?.completions ?? [])],
    unlocked: { ...(initial?.unlocked ?? {}) },
  };
  return {
    load: async () => ({ completions: [...data.completions], unlocked: { ...data.unlocked } }),
    record: async (completion, newUnlocks) => {
      data.completions.push(completion);
      for (const id of newUnlocks) data.unlocked[id] ??= completion.completedAt;
    },
  };
}
