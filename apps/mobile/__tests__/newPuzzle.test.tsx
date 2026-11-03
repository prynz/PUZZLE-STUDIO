import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { NewPuzzleScreen } from '@/features/puzzle/NewPuzzleScreen';
import { createMemoryImageStore } from '@/storage/images/memoryImageStore';
import type { StoredImage } from '@/storage/images/types';
import { createMemoryPuzzleStore } from '@/storage/puzzles/memoryPuzzleStore';
import { createMemorySettingsStore } from '@/storage/settingsStore';
import { ImagesProvider } from '@/store/images';
import { PuzzlesProvider } from '@/store/puzzles';
import { SettingsProvider } from '@/store/settings';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({ imageId: 'img-1' }),
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

describe('Neues Puzzle', () => {
  it('offers the usual piece counts and starts a puzzle with the chosen grid', async () => {
    const puzzles = createMemoryPuzzleStore();
    await render(
      <SettingsProvider store={createMemorySettingsStore({ 'play.profile': 'kid' })}>
        <ImagesProvider store={createMemoryImageStore([image])}>
          <PuzzlesProvider store={puzzles}>
            <NewPuzzleScreen />
          </PuzzlesProvider>
        </ImagesProvider>
      </SettingsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('pieces-64')).toBeTruthy());
    for (const n of [4, 9, 16, 25, 36, 49, 64, 100, 144, 196, 256])
      expect(screen.getByTestId(`pieces-${n}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pieces-16'));
    await fireEvent.press(screen.getByTestId('shape-square'));
    await fireEvent.press(screen.getByTestId('puzzle-start'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    const [created] = await puzzles.list();
    expect(created?.definition).toMatchObject({ rows: 4, cols: 4, shape: 'square', width: 1200, height: 900 });
    expect(created?.profile).toBe('kid');
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/puzzle/[id]', params: { id: created?.id } });
  });
});
