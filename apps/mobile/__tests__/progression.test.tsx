import { ENGINE_VERSION } from '@puzzle-studio/puzzle-engine';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { AwardsScreen } from '@/features/awards/AwardsScreen';
import { CollectionScreen } from '@/features/collection/CollectionScreen';
import { collectionItems, continueItem } from '@/features/collection/collectionView';
import { HomeScreen } from '@/features/home/HomeScreen';
import { Celebration } from '@/features/puzzle/Celebration';
import { createMemoryProgressStore } from '@/storage/progress/memoryProgressStore';
import type { StoredImage } from '@/storage/images/types';
import type { StoredPuzzle } from '@/storage/puzzles/types';
import { ProgressProvider, useProgress } from '@/store/progress';
import { AppProviders } from '@/testing/AppProviders';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() }),
}));

const image: StoredImage = {
  id: 'img-1',
  sourceKind: 'sample',
  width: 1200,
  height: 900,
  rotation: 0,
  crop: { x: 0, y: 0, w: 1, h: 1 },
  work: { uri: 'file:///work.jpg', width: 1200, height: 900 },
  thumbUri: 'file:///thumb.jpg',
  createdAt: 1,
};

const puzzle = (id: string, rows: number, cols: number, over: Partial<StoredPuzzle> = {}): StoredPuzzle => ({
  id,
  imageId: 'img-1',
  definition: { engineVersion: ENGINE_VERSION, seed: 1, rows, cols, shape: 'classic', width: 1200, height: 900 },
  profile: 'kid',
  status: 'in_progress',
  stateJson: null,
  placedCount: 3,
  createdAt: 1,
  updatedAt: 1,
  completedAt: null,
  ...over,
});

const done = (id: string, rows: number, cols: number, updatedAt: number) =>
  puzzle(id, rows, cols, { status: 'completed', placedCount: rows * cols, updatedAt, completedAt: updatedAt });

describe('collection view', () => {
  const list = [
    puzzle('a', 3, 3, { updatedAt: 5 }),
    done('b', 10, 10, 3),
    done('c', 4, 4, 9),
    puzzle('x', 2, 2, { imageId: 'gone' }),
  ];
  it('filters, sorts and drops puzzles whose picture is gone', () => {
    expect(collectionItems(list, [image], 'all', 'newest').map((i) => i.puzzle.id)).toEqual(['c', 'a', 'b']);
    expect(collectionItems(list, [image], 'all', 'biggest').map((i) => i.puzzle.id)).toEqual(['b', 'c', 'a']);
    expect(collectionItems(list, [image], 'done', 'newest').map((i) => i.puzzle.id)).toEqual(['c', 'b']);
    expect(collectionItems(list, [image], 'started', 'newest').map((i) => i.puzzle.id)).toEqual(['a']);
  });

  it('gives stars to finished puzzles and progress to the others; picks the puzzle to continue', () => {
    const items = collectionItems(list, [image], 'all', 'newest');
    expect(items.find((i) => i.puzzle.id === 'b')?.stars).toBe(3);
    expect(items.find((i) => i.puzzle.id === 'a')).toMatchObject({ stars: null, progress: 3 / 9 });
    expect(continueItem(items)?.puzzle.id).toBe('a');
    expect(continueItem([])).toBeNull();
  });
});

describe('progress provider', () => {
  it('records a completion, returns stars + new milestones and remembers them', async () => {
    const store = createMemoryProgressStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ProgressProvider store={store}>{children}</ProgressProvider>
    );
    const { result } = await renderHook(() => useProgress(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    let res: Awaited<ReturnType<typeof result.current.complete>> | null = null;
    await act(async () => {
      res = await result.current.complete({
        puzzleId: 'p',
        pieces: 36,
        shape: 'classic',
        sourceKind: 'camera',
        completedAt: 7,
      });
    });
    expect(res).toMatchObject({ stars: 2 });
    expect((res as unknown as { unlocked: { id: string }[] }).unlocked.map((a) => a.id)).toEqual([
      'first_puzzle',
      'own_photo',
      'pieces_25',
    ]);
    expect(result.current.stats.stars).toBe(2);
    expect(result.current.unlocked.has('own_photo')).toBe(true);
    expect((await store.load()).completions).toHaveLength(1);
    // the same puzzle again: no new milestones, no extra stars
    await act(async () => {
      res = await result.current.complete({
        puzzleId: 'p',
        pieces: 36,
        shape: 'classic',
        sourceKind: 'camera',
        completedAt: 8,
      });
    });
    expect((res as unknown as { unlocked: unknown[] }).unlocked).toEqual([]);
    expect(result.current.stats.stars).toBe(2);
  });
});

describe('Sammlung', () => {
  beforeEach(() => mockPush.mockClear());

  it('shows an honest empty state that leads to the atelier', async () => {
    await render(
      <AppProviders>
        <CollectionScreen />
      </AppProviders>,
    );
    await fireEvent.press(screen.getByText('Zum Atelier'));
    expect(mockPush).toHaveBeenCalledWith('/create');
  });

  it('filters finished puzzles and deletes one only after confirmation', async () => {
    await render(
      <AppProviders data={{ images: [image], puzzles: [puzzle('a', 3, 3), done('b', 4, 4, 2)] }}>
        <CollectionScreen />
      </AppProviders>,
    );
    await waitFor(() => expect(screen.getAllByTestId('collection-card')).toHaveLength(2));
    await fireEvent.press(screen.getByTestId('filter-done'));
    expect(screen.getAllByTestId('collection-card')).toHaveLength(1);
    expect(screen.getByLabelText('16 Teile, fertig, 1 Stern')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('filter-all'));
    await fireEvent.press(screen.getByLabelText('9 Teile, 3 gelegt'));
    await fireEvent.press(screen.getByTestId('sheet-delete'));
    await fireEvent.press(screen.getByTestId('confirm-yes'));
    await waitFor(() => expect(screen.getAllByTestId('collection-card')).toHaveLength(1));
  });

  it('continue opens the puzzle', async () => {
    await render(
      <AppProviders data={{ images: [image], puzzles: [puzzle('a', 3, 3)] }}>
        <CollectionScreen />
      </AppProviders>,
    );
    await waitFor(() => expect(screen.getAllByTestId('collection-card')).toHaveLength(1));
    await fireEvent.press(screen.getAllByTestId('collection-card')[0]!);
    await fireEvent.press(screen.getByTestId('sheet-play'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith({ pathname: '/puzzle/[id]', params: { id: 'a' } }));
  });
});

describe('Erfolge', () => {
  it('shows locked milestones with how-to and lets the child apply an unlocked background', async () => {
    await render(
      <AppProviders
        data={{
          progress: {
            completions: [{ puzzleId: 'p', pieces: 64, shape: 'classic', sourceKind: 'sample', completedAt: 1 }],
            unlocked: { first_puzzle: 1, pieces_25: 1, pieces_64: 1 },
          },
        }}
      >
        <AwardsScreen />
      </AppProviders>,
    );
    await waitFor(() => expect(screen.getByText('Du hast 2 Sterne gesammelt!')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('awards-milestones'));
    expect(screen.getByLabelText('Erstes Puzzle. Belohnung: Rahmen „Sonne“')).toBeTruthy();
    expect(screen.getByLabelText('Zehn Puzzles. Puzzle zehn Bilder fertig.')).toBeTruthy();
    expect(screen.getByText('3 von 10 Meilensteinen geschafft')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('awards-stickers'));
    expect(screen.getByLabelText('Sticker „Stern“')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('awards-rewards'));
    expect(screen.queryByTestId('reward-background_sky')).toBeNull(); // still locked
    await fireEvent.press(screen.getByTestId('reward-background_meadow'));
    expect(screen.getByTestId('reward-background_meadow').props.accessibilityState).toMatchObject({ selected: true });
  });
});

describe('Feier', () => {
  it('shows the stars and what was unlocked', async () => {
    await render(
      <Celebration
        visible
        total={36}
        result={{
          stars: 2,
          unlocked: [{ id: 'first_puzzle', reward: { id: 'frame_sun', kind: 'frame' }, reached: () => true }],
        }}
        onAgain={jest.fn()}
        onAtelier={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('2 von 3 Sternen für dieses Puzzle')).toBeTruthy();
    expect(screen.getByText('Neu: Erstes Puzzle')).toBeTruthy();
  });
});

describe('Start', () => {
  it('lets the child continue the last puzzle with one tap', async () => {
    mockPush.mockClear();
    await render(
      <AppProviders data={{ images: [image], puzzles: [puzzle('a', 3, 3)] }}>
        <HomeScreen />
      </AppProviders>,
    );
    await waitFor(() => expect(screen.getAllByTestId('home-puzzle')).toHaveLength(1));
    await fireEvent.press(screen.getByTestId('home-puzzle'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/puzzle/[id]', params: { id: 'a' } });
    // the story card on top leads to the same puzzle
    mockPush.mockClear();
    await fireEvent.press(screen.getByTestId('home-continue'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/puzzle/[id]', params: { id: 'a' } });
  });
});
