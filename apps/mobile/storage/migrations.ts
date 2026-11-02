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
];
