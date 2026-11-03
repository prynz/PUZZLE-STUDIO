import { createMemoryPuzzleStore } from './memoryPuzzleStore';
import type { PuzzleStore } from './types';

/** Web preview: like the images, puzzles live in memory for this browser session only. */
export function createPersistentPuzzleStore(): PuzzleStore {
  return createMemoryPuzzleStore();
}
