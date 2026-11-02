import { getDatabase } from './database';
import type { SettingsStore } from './settingsStore';

/** Native: settings live in the SQLite `setting` table. */
export function createPersistentSettingsStore(): SettingsStore {
  return {
    async getAll() {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{ key: string; value_json: string }>('SELECT key, value_json FROM setting');
      const out: Record<string, unknown> = {};
      for (const r of rows) {
        try {
          out[r.key] = JSON.parse(r.value_json) as unknown;
        } catch {
          // Corrupt value: ignore it, the default applies.
        }
      }
      return out;
    },
    async set(key, value) {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO setting (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json',
        key,
        JSON.stringify(value),
      );
    },
    async remove(key) {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM setting WHERE key = ?', key);
    },
  };
}
