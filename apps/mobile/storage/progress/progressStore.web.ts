import { createMemoryProgressStore } from './memoryProgressStore';
import type { ProgressStore } from './types';

/** Web preview: like images and puzzles, progress lives in memory for this session only. */
export function createPersistentProgressStore(): ProgressStore {
  return createMemoryProgressStore();
}
