import { createId } from '@/utils/id';

import type { ImageStore, StoredImage } from './types';

/** In-memory store: tests and the web preview (nothing is persisted). */
export function createMemoryImageStore(initial: StoredImage[] = []): ImageStore {
  let items = [...initial];
  return {
    list: async () => [...items].sort((a, b) => b.createdAt - a.createdAt),
    add: async (input) => {
      const img: StoredImage = {
        id: createId(),
        sourceKind: input.sourceKind,
        width: input.width,
        height: input.height,
        rotation: input.rotation,
        crop: input.crop,
        work: input.derived.work,
        thumbUri: input.derived.thumb.uri,
        createdAt: Date.now(),
      };
      items = [img, ...items];
      return img;
    },
    remove: async (id) => {
      items = items.filter((i) => i.id !== id);
    },
    clear: async () => {
      items = [];
    },
    usage: async () => null,
  };
}
