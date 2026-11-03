import type { Completion, PieceShapeKind, SourceKind } from '@puzzle-studio/game-progression';

import { getDatabase } from '../database';
import type { ProgressStore } from './types';

interface CompletionRow {
  puzzle_id: string;
  pieces: number;
  shape: PieceShapeKind;
  source_kind: SourceKind;
  completed_at: number;
}

/** Native: completion log + achievement unlocks in SQLite (migration 4). */
export function createPersistentProgressStore(): ProgressStore {
  return {
    async load() {
      const db = await getDatabase();
      const rows = await db.getAllAsync<CompletionRow>(
        'SELECT puzzle_id, pieces, shape, source_kind, completed_at FROM completion ORDER BY id',
      );
      const unlocks = await db.getAllAsync<{ achievement_id: string; unlocked_at: number }>(
        'SELECT achievement_id, unlocked_at FROM achievement_unlock',
      );
      const completions: Completion[] = rows.map((r) => ({
        puzzleId: r.puzzle_id,
        pieces: r.pieces,
        shape: r.shape,
        sourceKind: r.source_kind,
        completedAt: r.completed_at,
      }));
      return { completions, unlocked: Object.fromEntries(unlocks.map((u) => [u.achievement_id, u.unlocked_at])) };
    },

    async record(c, newUnlocks) {
      const db = await getDatabase();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO completion (puzzle_id, pieces, shape, source_kind, completed_at) VALUES (?, ?, ?, ?, ?)',
          c.puzzleId,
          c.pieces,
          c.shape,
          c.sourceKind,
          c.completedAt,
        );
        for (const id of newUnlocks)
          await db.runAsync(
            'INSERT OR IGNORE INTO achievement_unlock (achievement_id, unlocked_at) VALUES (?, ?)',
            id,
            c.completedAt,
          );
      });
    },
  };
}
