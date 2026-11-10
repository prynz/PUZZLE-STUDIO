import type { ReactNode } from 'react';

import { createMemoryImageStore } from '@/storage/images/memoryImageStore';
import type { StoredImage } from '@/storage/images/types';
import { createMemoryProgressStore } from '@/storage/progress/memoryProgressStore';
import type { ProgressSnapshot } from '@/storage/progress/types';
import { createMemoryPuzzleStore } from '@/storage/puzzles/memoryPuzzleStore';
import type { StoredPuzzle } from '@/storage/puzzles/types';
import { createMemorySettingsStore } from '@/storage/settingsStore';
import { ImagesProvider } from '@/store/images';
import { JourneyProvider } from '@/store/journey';
import { ProgressProvider } from '@/store/progress';
import { PuzzlesProvider } from '@/store/puzzles';
import { SettingsProvider } from '@/store/settings';

export interface TestData {
  settings?: Record<string, unknown>;
  images?: StoredImage[];
  puzzles?: StoredPuzzle[];
  progress?: ProgressSnapshot;
  /** Journey keys (journey.done, journey.active, journey.images). */
  journey?: Record<string, unknown>;
}

/** All app providers with in-memory stores – for screen tests (Jest only). */
export function AppProviders({ children, data = {} }: { children: ReactNode; data?: TestData }) {
  return (
    <SettingsProvider store={createMemorySettingsStore(data.settings)}>
      <ImagesProvider store={createMemoryImageStore(data.images)}>
        <PuzzlesProvider store={createMemoryPuzzleStore(data.puzzles)}>
          <ProgressProvider store={createMemoryProgressStore(data.progress)}>
            <JourneyProvider store={createMemorySettingsStore(data.journey)}>{children}</JourneyProvider>
          </ProgressProvider>
        </PuzzlesProvider>
      </ImagesProvider>
    </SettingsProvider>
  );
}
