import { createMemoryImageStore } from './memoryImageStore';
import type { ImageStore } from './types';

/**
 * Web preview: no file system → images live in memory for this browser session
 * only. iOS/Android persist them (SQLite + app sandbox).
 */
export function createPersistentImageStore(): ImageStore {
  return createMemoryImageStore();
}
