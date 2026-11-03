import type { AssistProfile, PuzzleDefinition } from '@puzzle-studio/puzzle-engine';

export type PuzzleStatus = 'new' | 'in_progress' | 'completed';

export interface StoredPuzzle {
  id: string;
  imageId: string;
  definition: PuzzleDefinition;
  /** Play-help profile chosen when the puzzle was started. */
  profile: AssistProfile;
  status: PuzzleStatus;
  /** Serialized engine state (null = not started yet). */
  stateJson: string | null;
  placedCount: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface NewPuzzle {
  imageId: string;
  definition: PuzzleDefinition;
  profile: AssistProfile;
}

export interface SaveProgress {
  stateJson: string;
  stateVersion: number;
  placedCount: number;
  completed: boolean;
}

export interface PuzzleStore {
  list(): Promise<StoredPuzzle[]>;
  create(input: NewPuzzle): Promise<StoredPuzzle>;
  save(id: string, progress: SaveProgress): Promise<StoredPuzzle>;
  /** Back to the start (state removed, status "new"). */
  reset(id: string): Promise<StoredPuzzle>;
  remove(id: string): Promise<void>;
}
