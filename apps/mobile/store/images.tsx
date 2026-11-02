import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { PendingImage } from '@/services/imageSources';
import { createPersistentImageStore } from '@/storage/images/imageStore';
import type { ImageStore, NewImage, StoredImage } from '@/storage/images/types';

interface ImagesContextValue {
  ready: boolean;
  images: StoredImage[];
  /** Image chosen in the atelier, waiting for the crop step (memory only). */
  pending: PendingImage | null;
  setPending: (p: PendingImage | null) => void;
  add: (img: NewImage) => Promise<StoredImage>;
  remove: (id: string) => Promise<void>;
  error: boolean;
}

const ImagesContext = createContext<ImagesContextValue | null>(null);

export function ImagesProvider({ children, store }: { children: ReactNode; store?: ImageStore }) {
  const [backend] = useState(() => store ?? createPersistentImageStore());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [pending, setPending] = useState<PendingImage | null>(null);

  useEffect(() => {
    let alive = true;
    backend
      .list()
      .then((list) => alive && setImages(list))
      .catch(() => alive && setError(true))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [backend]);

  const add = useCallback(
    async (img: NewImage) => {
      const stored = await backend.add(img);
      setImages((prev) => [stored, ...prev]);
      return stored;
    },
    [backend],
  );

  const remove = useCallback(
    async (id: string) => {
      await backend.remove(id);
      setImages((prev) => prev.filter((i) => i.id !== id));
    },
    [backend],
  );

  const value = useMemo(
    () => ({ ready, images, pending, setPending, add, remove, error }),
    [ready, images, pending, add, remove, error],
  );
  return <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>;
}

export function useImages(): ImagesContextValue {
  const ctx = useContext(ImagesContext);
  if (!ctx) throw new Error('useImages must be used inside <ImagesProvider>');
  return ctx;
}
