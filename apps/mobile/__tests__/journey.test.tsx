import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AwardsScreen } from '@/features/awards/AwardsScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { parseJourney } from '@/store/journey';
import { AppProviders } from '@/testing/AppProviders';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() }),
}));
jest.mock('@/services/imageSources', () => ({
  loadSample: jest.fn(async () => ({
    uri: 'file:///sample.jpg',
    width: 1200,
    height: 900,
    extension: 'jpg',
    kind: 'sample',
  })),
}));
jest.mock('@/services/imagePipeline', () => ({
  deriveImages: jest.fn(async () => ({
    work: { uri: 'file:///work.jpg', width: 1200, height: 900 },
    thumb: { uri: 'file:///thumb.jpg', width: 300, height: 225 },
    hash: 'h',
  })),
}));

describe('Pinos Reise', () => {
  beforeEach(() => mockPush.mockClear());

  it('reads stored progress and survives broken values', () => {
    expect(
      parseJourney({ 'journey.done': ['garden-1', 3], 'journey.active': { stationId: 'garden-2', puzzleId: 'p' } }),
    ).toMatchObject({ active: { stationId: 'garden-2', puzzleId: 'p' } });
    expect([...parseJourney({ 'journey.done': ['garden-1', 3] }).done]).toEqual(['garden-1']);
    expect(parseJourney({ 'journey.done': 'x', 'journey.active': 'y', 'journey.images': 5 })).toMatchObject({
      active: null,
      images: {},
    });
  });

  it('"Spielen" imports the picture once and starts a small puzzle for the next station', async () => {
    await render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );
    await fireEvent.press(screen.getByTestId('home-play'));
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/puzzle/[id]', params: { id: expect.any(String) } }),
    );
  });

  it('moves Pino on after a finished station', async () => {
    await render(
      <AppProviders data={{ journey: { 'journey.done': ['garden-1'] } }}>
        <HomeScreen />
      </AppProviders>,
    );
    expect(screen.getByText('Station 2 von 6')).toBeTruthy();
    expect(screen.getByText('Nächste Station: Segelboot · 4 Teile')).toBeTruthy();
    expect(screen.getByLabelText('Haus auf der Wiese – geschafft')).toBeTruthy();
  });

  it('puts the pictures of finished stations into the album', async () => {
    await render(
      <AppProviders data={{ journey: { 'journey.done': ['garden-1', 'garden-2'] } }}>
        <AwardsScreen />
      </AppProviders>,
    );
    expect(screen.getByText('2 von 6')).toBeTruthy();
    expect(screen.getByTestId('album-sticker-garden-1')).toBeTruthy();
    expect(screen.getByTestId('album-sticker-garden-2')).toBeTruthy();
    expect(screen.getByTestId('album-open-garden-3')).toBeTruthy();
  });
});
