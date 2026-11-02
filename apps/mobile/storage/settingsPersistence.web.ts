import type { SettingsStore } from './settingsStore';

const PREFIX = 'puzzle-studio:setting:';

/** Web preview: settings in localStorage (SQLite is not enabled on web). */
export function createPersistentSettingsStore(): SettingsStore {
  const ls = (): Storage | null => {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  };
  return {
    async getAll() {
      const s = ls();
      const out: Record<string, unknown> = {};
      if (!s) return out;
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (!k?.startsWith(PREFIX)) continue;
        try {
          out[k.slice(PREFIX.length)] = JSON.parse(s.getItem(k) ?? 'null') as unknown;
        } catch {
          // ignore corrupt entry
        }
      }
      return out;
    },
    async set(key, value) {
      ls()?.setItem(PREFIX + key, JSON.stringify(value));
    },
    async remove(key) {
      ls()?.removeItem(PREFIX + key);
    },
  };
}
