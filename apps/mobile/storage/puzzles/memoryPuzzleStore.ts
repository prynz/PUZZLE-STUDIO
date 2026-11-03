import { createId } from '@/utils/id';

import type { PuzzleStore, StoredPuzzle } from './types';

/** In-memory store: tests and the web preview (nothing is persisted). */
export function createMemoryPuzzleStore(initial: StoredPuzzle[] = []): PuzzleStore {
  let items = [...initial];
  const find = (id: string) => {
    const p = items.find((x) => x.id === id);
    if (!p) throw new Error('Puzzle not found');
    return p;
  };
  const replace = (next: StoredPuzzle) => {
    items = items.map((x) => (x.id === next.id ? next : x));
    return next;
  };
  return {
    list: async () => [...items].sort((a, b) => b.updatedAt - a.updatedAt),
    create: async (input) => {
      const now = Date.now();
      const p: StoredPuzzle = {
        id: createId(),
        imageId: input.imageId,
        definition: input.definition,
        profile: input.profile,
        status: 'new',
        stateJson: null,
        placedCount: 0,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      };
      items = [p, ...items];
      return p;
    },
    save: async (id, progress) => {
      const p = find(id);
      const now = Date.now();
      return replace({
        ...p,
        stateJson: progress.stateJson,
        placedCount: progress.placedCount,
        status: progress.completed ? 'completed' : 'in_progress',
        updatedAt: now,
        completedAt: progress.completed ? (p.completedAt ?? now) : null,
      });
    },
    reset: async (id) => {
      const p = find(id);
      return replace({
        ...p,
        stateJson: null,
        placedCount: 0,
        status: 'new',
        updatedAt: Date.now(),
        completedAt: null,
      });
    },
    remove: async (id) => {
      items = items.filter((x) => x.id !== id);
    },
    clear: async () => {
      items = [];
    },
  };
}
