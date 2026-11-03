/**
 * Versioned SQLite schema. Append new migrations – never edit applied ones.
 * Full target schema: docs/architecture/data-model.md
 */
export const MIGRATIONS: readonly { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `CREATE TABLE IF NOT EXISTS setting (
            key TEXT PRIMARY KEY NOT NULL,
            value_json TEXT NOT NULL
          );`,
  },
  {
    // Phase 3: images – original kept byte-identical, crop/rotation are parameters,
    // work version + thumbnail are derived files (docs/architecture/data-model.md).
    version: 2,
    sql: `CREATE TABLE IF NOT EXISTS image (
            id TEXT PRIMARY KEY NOT NULL,
            source_kind TEXT NOT NULL CHECK (source_kind IN ('camera', 'library', 'sample')),
            original_file TEXT NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            bytes INTEGER NOT NULL,
            rotation INTEGER NOT NULL DEFAULT 0 CHECK (rotation IN (0, 90, 180, 270)),
            crop_x REAL NOT NULL,
            crop_y REAL NOT NULL,
            crop_w REAL NOT NULL,
            crop_h REAL NOT NULL,
            work_file TEXT NOT NULL,
            work_width INTEGER NOT NULL,
            work_height INTEGER NOT NULL,
            thumb_file TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS image_created_at ON image (created_at DESC);`,
  },
  {
    // Phase 5: puzzles + saved game state. Geometry is never stored – it is regenerated
    // from (seed, rows, cols, shape, size, engine_version). Deleting an image deletes its puzzles.
    version: 3,
    sql: `CREATE TABLE IF NOT EXISTS puzzle (
            id TEXT PRIMARY KEY NOT NULL,
            image_id TEXT NOT NULL REFERENCES image(id) ON DELETE CASCADE,
            rows INTEGER NOT NULL,
            cols INTEGER NOT NULL,
            shape TEXT NOT NULL CHECK (shape IN ('classic', 'square')),
            seed INTEGER NOT NULL,
            engine_version INTEGER NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            profile TEXT NOT NULL CHECK (profile IN ('toddler', 'kid', 'pro')),
            status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'completed')),
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            completed_at INTEGER
          );
          CREATE INDEX IF NOT EXISTS puzzle_image ON puzzle (image_id);
          CREATE TABLE IF NOT EXISTS puzzle_state (
            puzzle_id TEXT PRIMARY KEY NOT NULL REFERENCES puzzle(id) ON DELETE CASCADE,
            state_version INTEGER NOT NULL,
            state_json TEXT NOT NULL,
            placed_count INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );`,
  },
];
