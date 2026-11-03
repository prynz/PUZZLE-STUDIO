import type { AssistProfile, PieceShapeStyle } from '@puzzle-studio/puzzle-engine';

import { createId } from '@/utils/id';

import { getDatabase } from '../database';
import type { PuzzleStatus, PuzzleStore, StoredPuzzle } from './types';

interface PuzzleRow {
  id: string;
  image_id: string;
  rows: number;
  cols: number;
  shape: PieceShapeStyle;
  seed: number;
  engine_version: number;
  width: number;
  height: number;
  profile: AssistProfile;
  status: PuzzleStatus;
  created_at: number;
  updated_at: number;
  completed_at: number | null;
  state_json: string | null;
  placed_count: number | null;
}

const SELECT = `SELECT p.*, s.state_json, s.placed_count FROM puzzle p LEFT JOIN puzzle_state s ON s.puzzle_id = p.id`;

function toStored(r: PuzzleRow): StoredPuzzle {
  return {
    id: r.id,
    imageId: r.image_id,
    definition: {
      engineVersion: r.engine_version,
      seed: r.seed,
      rows: r.rows,
      cols: r.cols,
      shape: r.shape,
      width: r.width,
      height: r.height,
    },
    profile: r.profile,
    status: r.status,
    stateJson: r.state_json,
    placedCount: r.placed_count ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
  };
}

/** Native: puzzle + puzzle_state in SQLite (docs/architecture/data-model.md). */
export function createPersistentPuzzleStore(): PuzzleStore {
  const get = async (id: string) => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<PuzzleRow>(`${SELECT} WHERE p.id = ?`, id);
    if (!row) throw new Error('Puzzle not found');
    return toStored(row);
  };
  return {
    async list() {
      const db = await getDatabase();
      const rows = await db.getAllAsync<PuzzleRow>(`${SELECT} ORDER BY p.updated_at DESC`);
      return rows.map(toStored);
    },

    async create(input) {
      const db = await getDatabase();
      const id = createId();
      const now = Date.now();
      const d = input.definition;
      await db.runAsync(
        `INSERT INTO puzzle (id, image_id, rows, cols, shape, seed, engine_version, width, height, profile, status,
           created_at, updated_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, NULL)`,
        id,
        input.imageId,
        d.rows,
        d.cols,
        d.shape,
        d.seed,
        d.engineVersion,
        d.width,
        d.height,
        input.profile,
        now,
        now,
      );
      return get(id);
    },

    async save(id, progress) {
      const db = await getDatabase();
      const now = Date.now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO puzzle_state (puzzle_id, state_version, state_json, placed_count, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(puzzle_id) DO UPDATE SET state_version = excluded.state_version,
             state_json = excluded.state_json, placed_count = excluded.placed_count, updated_at = excluded.updated_at`,
          id,
          progress.stateVersion,
          progress.stateJson,
          progress.placedCount,
          now,
        );
        await db.runAsync(
          `UPDATE puzzle SET status = ?, updated_at = ?,
             completed_at = CASE WHEN ? THEN COALESCE(completed_at, ?) ELSE NULL END
           WHERE id = ?`,
          progress.completed ? 'completed' : 'in_progress',
          now,
          progress.completed ? 1 : 0,
          now,
          id,
        );
      });
      return get(id);
    },

    async reset(id) {
      const db = await getDatabase();
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM puzzle_state WHERE puzzle_id = ?', id);
        await db.runAsync(
          `UPDATE puzzle SET status = 'new', updated_at = ?, completed_at = NULL WHERE id = ?`,
          Date.now(),
          id,
        );
      });
      return get(id);
    },

    async remove(id) {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM puzzle WHERE id = ?', id);
    },
  };
}
