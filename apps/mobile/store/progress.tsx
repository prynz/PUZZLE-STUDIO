import {
  newlyReached,
  starsFor,
  statsFrom,
  type Achievement,
  type Completion,
  type Stats,
} from '@puzzle-studio/game-progression';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createPersistentProgressStore } from '@/storage/progress/progressStore';
import type { ProgressStore } from '@/storage/progress/types';

export interface CompletionResult {
  stars: 1 | 2 | 3;
  unlocked: Achievement[];
}

interface ProgressContextValue {
  ready: boolean;
  stats: Stats;
  unlocked: ReadonlySet<string>;
  /** Records a finished puzzle and returns stars + achievements unlocked right now. */
  complete: (c: Completion) => Promise<CompletionResult>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children, store }: { children: ReactNode; store?: ProgressStore }) {
  const [backend] = useState(() => store ?? createPersistentProgressStore());
  const [ready, setReady] = useState(false);
  const [log, setLog] = useState<Completion[]>([]);
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let alive = true;
    backend
      .load()
      .then((snap) => {
        if (!alive) return;
        setLog(snap.completions);
        setUnlocked(new Set(Object.keys(snap.unlocked)));
      })
      .catch(() => undefined) // without stored progress the app still works; nothing is lost on disk
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [backend]);

  const complete = useCallback(
    async (c: Completion) => {
      const nextLog = [...log, c];
      const reached = newlyReached(nextLog, unlocked);
      await backend.record(
        c,
        reached.map((a) => a.id),
      );
      setLog(nextLog);
      setUnlocked((prev) => new Set([...prev, ...reached.map((a) => a.id)]));
      return { stars: starsFor(c.pieces), unlocked: reached };
    },
    [backend, log, unlocked],
  );

  const stats = useMemo(() => statsFrom(log), [log]);
  const value = useMemo(() => ({ ready, stats, unlocked, complete }), [ready, stats, unlocked, complete]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
