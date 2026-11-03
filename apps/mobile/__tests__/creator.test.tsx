import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CreateScreen } from '@/features/creator/CreateScreen';
import { extensionFor } from '@/services/imageSources';
import { createMemoryImageStore } from '@/storage/images/memoryImageStore';
import type { StoredImage } from '@/storage/images/types';
import { createMemoryPuzzleStore } from '@/storage/puzzles/memoryPuzzleStore';
import { ImagesProvider } from '@/store/images';
import { PuzzlesProvider } from '@/store/puzzles';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn(), dismissTo: jest.fn() }) }));
jest.mock('@/services/imageSources', () => ({
  ...jest.requireActual('@/services/imageSources'),
  pickFromLibrary: jest.fn(async () => ({ status: 'canceled' })),
  takePhoto: jest.fn(async () => ({ status: 'denied' })),
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

const renderCreate = async (initial: StoredImage[] = []) => {
  const store = createMemoryImageStore(initial);
  await render(
    <ImagesProvider store={store}>
      <PuzzlesProvider store={createMemoryPuzzleStore()}>
        <CreateScreen />
      </PuzzlesProvider>
    </ImagesProvider>,
  );
  return store;
};

describe('Puzzle-Atelier', () => {
  beforeEach(() => mockPush.mockClear());

  it('offers camera, gallery and samples and shows the empty state', async () => {
    await renderCreate();
    expect(screen.getByRole('button', { name: 'Foto aufnehmen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Aus der Galerie' })).toBeTruthy();
    await fireEvent.press(screen.getByTestId('src-samples'));
    expect(mockPush).toHaveBeenCalledWith('/creator/samples');
    expect(screen.getByText('Noch keine Bilder. Such dir oben eines aus!')).toBeTruthy();
  });

  it('explains a denied camera permission instead of failing silently', async () => {
    await renderCreate();
    await fireEvent.press(screen.getByTestId('src-camera'));
    await waitFor(() => expect(screen.getByText(/darf die Kamera nicht benutzen/)).toBeTruthy());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens "Neues Puzzle" when a saved picture is tapped', async () => {
    await renderCreate([image]);
    await waitFor(() => expect(screen.getAllByTestId('my-image')).toHaveLength(1));
    await fireEvent.press(screen.getByTestId('my-image'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/puzzle/new', params: { imageId: 'img-1' } });
  });

  it('deletes an image only after confirmation', async () => {
    const store = await renderCreate([image]);
    await waitFor(() => expect(screen.getAllByTestId('my-image')).toHaveLength(1));
    await fireEvent.press(screen.getByLabelText('Bild löschen'));
    await fireEvent.press(screen.getByTestId('confirm-no'));
    expect(await store.list()).toHaveLength(1);
    await fireEvent.press(screen.getByLabelText('Bild löschen'));
    await fireEvent.press(screen.getByTestId('confirm-yes'));
    await waitFor(() => expect(screen.queryAllByTestId('my-image')).toHaveLength(0));
    expect(await store.list()).toHaveLength(0);
  });
});

describe('extensionFor', () => {
  it('derives the extension from the MIME type only (never from file names)', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('image/HEIC')).toBe('heic');
    expect(extensionFor(undefined)).toBe('jpg');
    expect(extensionFor('application/x-unknown')).toBe('jpg');
  });
});
