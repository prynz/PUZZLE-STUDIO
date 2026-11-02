/**
 * Key/value settings persistence. Values are JSON-serialized.
 * Implementations: SQLite (native, ./sqliteSettingsStore), localStorage (web),
 * in-memory (tests).
 */
export interface SettingsStore {
  getAll(): Promise<Record<string, unknown>>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createMemorySettingsStore(initial: Record<string, unknown> = {}): SettingsStore {
  const data = new Map(Object.entries(initial));
  return {
    getAll: async () => Object.fromEntries(data),
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}
