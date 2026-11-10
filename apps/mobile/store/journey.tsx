import { journeyPosition, type JourneyPosition } from '@puzzle-studio/game-progression';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createPersistentSettingsStore } from '@/storage/settingsPersistence';
import type { SettingsStore } from '@/storage/settingsStore';

/** The station being played right now and its puzzle (finishing that puzzle finishes the station). */
export interface ActiveStation {
  stationId: string;
  puzzleId: string;
}

const KEYS = {
  done: 'journey.done',
  active: 'journey.active',
  images: 'journey.images',
} as const;

interface JourneyData {
  done: ReadonlySet<string>;
  active: ActiveStation | null;
  /** Picture id → stored image id (journey pictures are imported once and reused). */
  images: Readonly<Record<string, string>>;
}

const EMPTY: JourneyData = { done: new Set(), active: null, images: {} };

/** Validates stored values field by field – broken values fall back to "nothing played yet". */
export function parseJourney(raw: Record<string, unknown>): JourneyData {
  const list: unknown = raw[KEYS.done];
  const done = Array.isArray(list) ? list.filter((v): v is string => typeof v === 'string') : [];
  const a = raw[KEYS.active];
  const active =
    typeof a === 'object' && a !== null && 'stationId' in a && 'puzzleId' in a
      ? typeof a.stationId === 'string' && typeof a.puzzleId === 'string'
        ? { stationId: a.stationId, puzzleId: a.puzzleId }
        : null
      : null;
  const img = raw[KEYS.images];
  const images: Record<string, string> = {};
  if (typeof img === 'object' && img !== null)
    for (const [k, v] of Object.entries(img)) if (typeof v === 'string') images[k] = v;
  return { done: new Set(done), active, images };
}

interface JourneyContextValue extends JourneyData {
  ready: boolean;
  position: JourneyPosition;
  /** Image ids that belong to the journey (kept out of "Meine Bilder" in the atelier). */
  journeyImageIds: ReadonlySet<string>;
  setActive: (active: ActiveStation) => Promise<void>;
  rememberImage: (picture: string, imageId: string) => Promise<void>;
  /** The puzzle `puzzleId` was finished – finishes its station if it is the active one. Returns the station id. */
  finishPuzzle: (puzzleId: string) => Promise<string | null>;
  clearAll: () => Promise<void>;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

/** Pino's journey progress (concept 2 §3) – persisted in the key/value store (SQLite / web storage). */
export function JourneyProvider({ children, store }: { children: ReactNode; store?: SettingsStore }) {
  const [backend] = useState(() => store ?? createPersistentSettingsStore());
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<JourneyData>(EMPTY);

  useEffect(() => {
    let alive = true;
    backend
      .getAll()
      .then((raw) => alive && setData(parseJourney(raw)))
      .catch(() => undefined) // without stored progress the journey simply starts at station 1
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [backend]);

  const setActive = useCallback(
    async (active: ActiveStation) => {
      setData((d) => ({ ...d, active }));
      await backend.set(KEYS.active, active);
    },
    [backend],
  );

  const rememberImage = useCallback(
    async (picture: string, imageId: string) => {
      const images = { ...data.images, [picture]: imageId };
      setData((d) => ({ ...d, images }));
      await backend.set(KEYS.images, images);
    },
    [backend, data.images],
  );

  const finishPuzzle = useCallback(
    async (puzzleId: string) => {
      const active = data.active;
      if (!active || active.puzzleId !== puzzleId) return null;
      const done = new Set(data.done).add(active.stationId);
      setData((d) => ({ ...d, done, active: null }));
      await backend.set(KEYS.done, [...done]);
      await backend.remove(KEYS.active);
      return active.stationId;
    },
    [backend, data.active, data.done],
  );

  const clearAll = useCallback(async () => {
    await Promise.all(Object.values(KEYS).map((k) => backend.remove(k)));
    setData(EMPTY);
  }, [backend]);

  const value = useMemo(
    () => ({
      ...data,
      ready,
      position: journeyPosition(data.done),
      journeyImageIds: new Set(Object.values(data.images)),
      setActive,
      rememberImage,
      finishPuzzle,
      clearAll,
    }),
    [data, ready, setActive, rememberImage, finishPuzzle, clearAll],
  );
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used inside <JourneyProvider>');
  return ctx;
}
