import { starsFor } from '@puzzle-studio/game-progression';

import type { StoredImage } from '@/storage/images/types';
import type { StoredPuzzle } from '@/storage/puzzles/types';

export type CollectionFilter = 'all' | 'started' | 'done';
export type CollectionSort = 'newest' | 'biggest';

export interface CollectionItem {
  puzzle: StoredPuzzle;
  image: StoredImage;
  pieces: number;
  done: boolean;
  /** 0 … 1 */
  progress: number;
  stars: number | null;
}

/** Puzzles with their picture, filtered and sorted for the collection (pure, tested). */
export function collectionItems(
  puzzles: readonly StoredPuzzle[],
  images: readonly StoredImage[],
  filter: CollectionFilter,
  sort: CollectionSort,
): CollectionItem[] {
  const byId = new Map(images.map((i) => [i.id, i]));
  const items: CollectionItem[] = [];
  for (const p of puzzles) {
    const image = byId.get(p.imageId);
    if (!image) continue; // picture deleted → its puzzles are gone too (cascade)
    const pieces = p.definition.rows * p.definition.cols;
    const done = p.status === 'completed';
    if (filter === 'done' && !done) continue;
    if (filter === 'started' && done) continue;
    items.push({
      puzzle: p,
      image,
      pieces,
      done,
      progress: pieces ? p.placedCount / pieces : 0,
      stars: done ? starsFor(pieces) : null,
    });
  }
  return items.sort((a, b) =>
    sort === 'biggest'
      ? b.pieces - a.pieces || b.puzzle.updatedAt - a.puzzle.updatedAt
      : b.puzzle.updatedAt - a.puzzle.updatedAt,
  );
}

/** The puzzle to continue on the home screen: most recently played, not finished. */
export function continueItem(items: readonly CollectionItem[]): CollectionItem | null {
  return items.filter((i) => !i.done && i.puzzle.status === 'in_progress')[0] ?? null;
}
