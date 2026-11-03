import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createPersistentPuzzleStore } from '@/storage/puzzles/puzzleStore';
import type { NewPuzzle, PuzzleStore, SaveProgress, StoredPuzzle } from '@/storage/puzzles/types';

interface PuzzlesContextValue {
  ready: boolean;
  error: boolean;
  puzzles: StoredPuzzle[];
  create: (input: NewPuzzle) => Promise<StoredPuzzle>;
  save: (id: string, progress: SaveProgress) => Promise<void>;
  reset: (id: string) => Promise<void>;
  /** Deletes one puzzle (the picture stays in the atelier, earned stars stay too). */
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  /** Called after an image was deleted (SQLite cascades; memory store and UI state follow here). */
  forgetImage: (imageId: string) => Promise<void>;
}

const PuzzlesContext = createContext<PuzzlesContextValue | null>(null);

export function PuzzlesProvider({ children, store }: { children: ReactNode; store?: PuzzleStore }) {
  const [backend] = useState(() => store ?? createPersistentPuzzleStore());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [puzzles, setPuzzles] = useState<StoredPuzzle[]>([]);

  useEffect(() => {
    let alive = true;
    backend
      .list()
      .then((list) => alive && setPuzzles(list))
      .catch(() => alive && setError(true))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [backend]);

  const upsert = useCallback((p: StoredPuzzle) => setPuzzles((prev) => [p, ...prev.filter((x) => x.id !== p.id)]), []);

  const create = useCallback(
    async (input: NewPuzzle) => {
      const p = await backend.create(input);
      upsert(p);
      return p;
    },
    [backend, upsert],
  );
  const save = useCallback(
    async (id: string, progress: SaveProgress) => upsert(await backend.save(id, progress)),
    [backend, upsert],
  );
  const reset = useCallback(async (id: string) => upsert(await backend.reset(id)), [backend, upsert]);
  const remove = useCallback(
    async (id: string) => {
      await backend.remove(id);
      setPuzzles((prev) => prev.filter((p) => p.id !== id));
    },
    [backend],
  );
  const clearAll = useCallback(async () => {
    await backend.clear();
    setPuzzles([]);
  }, [backend]);
  const forgetImage = useCallback(
    async (imageId: string) => {
      const gone = puzzles.filter((p) => p.imageId === imageId);
      await Promise.all(gone.map((p) => backend.remove(p.id)));
      setPuzzles((prev) => prev.filter((p) => p.imageId !== imageId));
    },
    [backend, puzzles],
  );

  const value = useMemo(
    () => ({ ready, error, puzzles, create, save, reset, remove, clearAll, forgetImage }),
    [ready, error, puzzles, create, save, reset, remove, clearAll, forgetImage],
  );
  return <PuzzlesContext.Provider value={value}>{children}</PuzzlesContext.Provider>;
}

export function usePuzzles(): PuzzlesContextValue {
  const ctx = useContext(PuzzlesContext);
  if (!ctx) throw new Error('usePuzzles must be used inside <PuzzlesProvider>');
  return ctx;
}
