import * as SQLite from 'expo-sqlite';

import { MIGRATIONS } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens the app database once and applies pending migrations. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('puzzle-studio.db');
    await db.execAsync(
      'PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS schema_migration (version INTEGER PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL);',
    );
    const rows = await db.getAllAsync<{ version: number }>('SELECT version FROM schema_migration');
    const applied = new Set(rows.map((r) => r.version));
    for (const m of MIGRATIONS) {
      if (applied.has(m.version)) continue;
      await db.withTransactionAsync(async () => {
        await db.execAsync(m.sql);
        await db.runAsync('INSERT INTO schema_migration (version, applied_at) VALUES (?, ?)', m.version, Date.now());
      });
    }
    return db;
  })();
  return dbPromise;
}
