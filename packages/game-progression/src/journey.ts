/**
 * Pino's journey (concept 2 §3, docs/product/concept-v2-toddler.md): worlds with a fixed row of
 * stations. "Spielen" always starts the next open station; finished stations stay playable.
 * Pure and deterministic – station ids are stored, never rename them.
 */

/** Station kinds – mini games follow in step K3. */
export type StationKind = 'puzzle';

export interface Station {
  id: string;
  kind: StationKind;
  /** Picture id (bundled sample picture of the app). */
  picture: string;
  /** Wished piece count (the grid is chosen for the picture's aspect ratio). */
  pieces: number;
}

export interface World {
  id: string;
  stations: readonly Station[];
}

/**
 * The worlds in journey order. Until the PO's pictures arrive, world 1 uses the four bundled
 * sample pictures and grows from 4 to 9 pieces (concept 2 §8).
 */
export const WORLDS: readonly World[] = [
  {
    id: 'garden',
    stations: [
      { id: 'garden-1', kind: 'puzzle', picture: 'meadow-house', pieces: 4 },
      { id: 'garden-2', kind: 'puzzle', picture: 'sea-boat', pieces: 4 },
      { id: 'garden-3', kind: 'puzzle', picture: 'garden', pieces: 4 },
      { id: 'garden-4', kind: 'puzzle', picture: 'night-sky', pieces: 6 },
      { id: 'garden-5', kind: 'puzzle', picture: 'meadow-house', pieces: 6 },
      { id: 'garden-6', kind: 'puzzle', picture: 'garden', pieces: 9 },
    ],
  },
];

export interface JourneyPosition {
  /** World Pino is in (the last one once everything is done). */
  world: World;
  worldIndex: number;
  /** Index of the next open station in that world (= stations.length when the world is done). */
  stationIndex: number;
  /** Next station to play, or null when the whole journey is done. */
  next: Station | null;
}

/** Where Pino is: the first world with an open station, and its first open station. */
export function journeyPosition(done: ReadonlySet<string>, worlds: readonly World[] = WORLDS): JourneyPosition {
  for (let w = 0; w < worlds.length; w++) {
    const world = worlds[w];
    if (!world) continue;
    const i = world.stations.findIndex((s) => !done.has(s.id));
    if (i !== -1) return { world, worldIndex: w, stationIndex: i, next: world.stations[i] ?? null };
  }
  const last = worlds.length - 1;
  const world = worlds[last] ?? { id: 'none', stations: [] };
  return { world, worldIndex: Math.max(0, last), stationIndex: world.stations.length, next: null };
}

/** The station with this id, if it exists. */
export function findStation(id: string, worlds: readonly World[] = WORLDS): Station | undefined {
  for (const w of worlds) {
    const s = w.stations.find((st) => st.id === id);
    if (s) return s;
  }
  return undefined;
}

/** A station can be played when it is done (replay) or the next open one – later ones wait. */
export function isPlayable(id: string, done: ReadonlySet<string>, worlds: readonly World[] = WORLDS): boolean {
  if (done.has(id)) return true;
  return journeyPosition(done, worlds).next?.id === id;
}
