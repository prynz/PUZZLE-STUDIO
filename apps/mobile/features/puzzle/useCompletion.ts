import { useCallback, useEffect, useRef, useState } from 'react';

import type { StoredImage } from '@/storage/images/types';
import type { StoredPuzzle } from '@/storage/puzzles/types';
import { useProgress, type CompletionResult } from '@/store/progress';

/**
 * Records a finished puzzle once per completion (not when an already finished puzzle is
 * merely opened) and returns the stars and newly unlocked milestones for the celebration.
 */
export function useCompletion(stored: StoredPuzzle, image: StoredImage, complete: boolean) {
  const { complete: record } = useProgress();
  const [result, setResult] = useState<CompletionResult | null>(null);
  const handled = useRef(complete);
  useEffect(() => {
    if (!complete) {
      handled.current = false;
      return;
    }
    if (handled.current) return;
    handled.current = true;
    record({
      puzzleId: stored.id,
      pieces: stored.definition.rows * stored.definition.cols,
      shape: stored.definition.shape,
      sourceKind: image.sourceKind,
      completedAt: Date.now(),
    })
      .then(setResult)
      .catch(() => undefined); // the celebration still shows; progress is retried with the next puzzle
  }, [complete, record, stored, image.sourceKind]);
  const clear = useCallback(() => setResult(null), []);
  return { result, clear };
}
