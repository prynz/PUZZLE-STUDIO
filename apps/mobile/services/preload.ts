import { MASCOT_ART_SOURCES } from '@puzzle-studio/ui';
import { Asset } from 'expo-asset';

import { loadSkia } from './skiaLoader';

/** Work done once while the start screen is shown, so the first screens open without waiting. */
export interface PreloadTask {
  key: string;
  run: () => Promise<unknown>;
}

export const PRELOAD_TASKS: readonly PreloadTask[] = [
  // Pino's artwork (decoded once, no pop-in on the first screens)
  { key: 'mascot', run: () => Asset.loadAsync(Object.values(MASCOT_ART_SOURCES)) },
  // puzzle graphics engine (web: CanvasKit WebAssembly; native: already linked)
  { key: 'graphics', run: () => loadSkia() },
];
