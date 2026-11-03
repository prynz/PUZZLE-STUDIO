import {
  STATE_VERSION,
  isComplete,
  lockedCount,
  serializeState,
  type Puzzle,
  type PuzzleState,
} from '@puzzle-studio/puzzle-engine';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import type { SaveProgress } from '@/storage/puzzles/types';

export const SAVE_DEBOUNCE_MS = 500;

/**
 * Saves the game 500 ms after the last move and immediately when the app goes to the
 * background or the screen closes (docs/puzzle-engine/serialization.md). The initial state is not saved.
 */
export function useAutosave(puzzle: Puzzle, state: PuzzleState, save: (p: SaveProgress) => Promise<void>) {
  const pending = useRef<SaveProgress | null>(null);
  const first = useRef(true);
  const flush = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    if (p) save(p).catch(() => undefined); // a failed save is retried with the next move
  }, [save]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pending.current = {
      stateJson: serializeState(puzzle, state),
      stateVersion: STATE_VERSION,
      placedCount: lockedCount(state),
      completed: isComplete(state),
    };
    const t = setTimeout(flush, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [state, puzzle, flush]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s !== 'active' && flush());
    return () => {
      sub.remove();
      flush();
    };
  }, [flush]);
}
