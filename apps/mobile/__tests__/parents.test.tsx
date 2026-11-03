import { ENGINE_VERSION, generatePuzzle } from '@puzzle-studio/puzzle-engine';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ParentsScreen } from '@/features/parents/ParentsScreen';
import { NUMBER_WORDS } from '@/features/parents/gate';
import { formatBytes } from '@/features/parents/storageView';
import { useGame } from '@/features/puzzle/game/useGame';
import { useHintOffer } from '@/features/puzzle/useHintOffer';
import type { StoredImage } from '@/storage/images/types';
import type { StoredPuzzle } from '@/storage/puzzles/types';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';
import { AppProviders, type TestData } from '@/testing/AppProviders';

const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: mockBack, dismissTo: jest.fn() }),
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

const stored = (profile: StoredPuzzle['profile']): StoredPuzzle => ({
  id: 'p1',
  imageId: 'img-1',
  definition: { engineVersion: ENGINE_VERSION, seed: 3, rows: 2, cols: 2, shape: 'classic', width: 1200, height: 900 },
  profile,
  status: 'completed',
  stateJson: null,
  placedCount: 4,
  createdAt: 1,
  updatedAt: 1,
  completedAt: 1,
});

const words = () => String(screen.getByTestId('gate-task').props.children).split(' · ');
const digitOf = (word: string) => (NUMBER_WORDS as readonly string[]).indexOf(word) + 1;

async function openGate() {
  for (const w of words()) await fireEvent.press(screen.getByTestId(`gate-digit-${digitOf(w)}`));
  await screen.findByTestId('parents-title');
}

function renderParents(data: TestData = {}) {
  return render(
    <AppProviders data={data}>
      <ParentsScreen />
    </AppProviders>,
  );
}

beforeEach(() => {
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('parent gate', () => {
  it('opens only after the three numbers written as words', async () => {
    await renderParents();
    expect(screen.queryByTestId('parents-title')).toBeNull();
    const first = words();
    expect(first).toHaveLength(3);
    // a wrong digit gives a new task and a friendly note – nothing opens
    const wrong = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((d) => d !== digitOf(first[0] as string)) as number;
    await fireEvent.press(screen.getByTestId(`gate-digit-${wrong}`));
    expect(screen.getByText('Nicht ganz – hier ist eine neue Aufgabe.')).toBeTruthy();
    expect(screen.queryByTestId('parents-title')).toBeNull();
    await openGate();
  });

  it('goes back to playing on cancel', async () => {
    await renderParents();
    await fireEvent.press(screen.getByTestId('gate-cancel'));
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('parents area', () => {
  it('saves play options and hides the misplace choice for toddlers', async () => {
    let settings: ReturnType<typeof useSettings> | null = null;
    function Probe() {
      settings = useSettings();
      return null;
    }
    await render(
      <AppProviders>
        <Probe />
        <ParentsScreen />
      </AppProviders>,
    );
    await openGate();
    await fireEvent.press(screen.getByTestId('misplace-return'));
    await fireEvent.press(screen.getByTestId('toggle-reference'));
    await fireEvent.press(screen.getByTestId('toggle-reduce-motion'));
    await waitFor(() =>
      expect(settings?.settings.parent).toEqual({
        misplace: 'return',
        reference: false,
        hintOffers: true,
        reduceMotion: true,
      }),
    );
    await fireEvent.press(screen.getByTestId('parents-profile-toddler'));
    await waitFor(() => expect(screen.queryByTestId('misplace-nudge')).toBeNull());
  });

  it('shows what is stored and deletes everything only after confirming', async () => {
    let probe: { images: number; puzzles: number; stars: number; onboarding: boolean } | null = null;
    function Probe() {
      const s = useSettings();
      probe = {
        images: useImages().images.length,
        puzzles: usePuzzles().puzzles.length,
        stars: useProgress().stats.stars,
        onboarding: s.settings.onboardingCompleted,
      };
      return null;
    }
    const data: TestData = {
      settings: { 'onboarding.completed': true },
      images: [image],
      puzzles: [stored('kid')],
      progress: {
        completions: [{ puzzleId: 'p1', pieces: 4, shape: 'classic', sourceKind: 'sample', completedAt: 1 }],
        unlocked: { first_puzzle: 1 },
      },
    };
    await render(
      <AppProviders data={data}>
        <Probe />
        <ParentsScreen />
      </AppProviders>,
    );
    await openGate();
    await fireEvent.press(screen.getByTestId('parents-data'));
    expect(screen.getByTestId('data-images').props.children).toBe('1');
    expect(screen.getByTestId('data-puzzles').props.children).toBe('1');
    await waitFor(() => expect(screen.getByTestId('data-space').props.children).toBe('nur im Browser'));

    await fireEvent.press(screen.getByTestId('data-wipe'));
    await fireEvent.press(screen.getByTestId('confirm-no'));
    expect(probe).toMatchObject({ images: 1, puzzles: 1 });

    await fireEvent.press(screen.getByTestId('data-wipe'));
    await fireEvent.press(screen.getByTestId('confirm-yes'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'));
    expect(probe).toEqual({ images: 0, puzzles: 0, stars: 0, onboarding: false });
  });

  it('explains privacy and backups', async () => {
    await renderParents();
    await openGate();
    await fireEvent.press(screen.getByTestId('parents-info'));
    expect(screen.getByTestId('parents-privacy')).toBeTruthy();
    expect(screen.getByTestId('parents-system-check')).toBeTruthy();
  });
});

describe('parents options in the game', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>;
  const puzzle = generatePuzzle(stored('kid').definition);
  const fresh = (profile: StoredPuzzle['profile']) => ({ ...stored(profile), status: 'new' as const, placedCount: 0 });

  it('overrides how misplaced pieces behave – but never for toddlers', async () => {
    const options = { misplace: 'return' as const, reference: false };
    const kid = await renderHook(() => useGame(fresh('kid'), puzzle, async () => undefined, options), { wrapper });
    expect(kid.result.current.state.misplaceMode).toBe('return');
    expect(kid.result.current.state.referenceVisible).toBe(false);
    const nudge = { misplace: 'nudge' as const, reference: true };
    const toddler = await renderHook(() => useGame(fresh('toddler'), puzzle, async () => undefined, nudge), {
      wrapper,
    });
    expect(toddler.result.current.state.misplaceMode).toBe('return');
  });
});

describe('hint offer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('comes after a while without progress and can be waved away', async () => {
    const { result, rerender } = await renderHook(
      ({ placed, busy }: { placed: number; busy: boolean }) => useHintOffer(placed, 45, true, busy),
      { initialProps: { placed: 0, busy: false } },
    );
    expect(result.current.offered).toBe(false);
    await act(async () => jest.advanceTimersByTime(45_000));
    expect(result.current.offered).toBe(true);
    await act(async () => result.current.dismiss());
    expect(result.current.offered).toBe(false);
    // progress starts a new wait; being busy (e.g. a hint is showing) pauses it
    await rerender({ placed: 1, busy: true });
    await act(async () => jest.advanceTimersByTime(60_000));
    expect(result.current.offered).toBe(false);
  });

  it('never comes when switched off or for the pro profile', async () => {
    const off = await renderHook(() => useHintOffer(0, 20, false, false));
    const pro = await renderHook(() => useHintOffer(0, null, true, false));
    await act(async () => jest.advanceTimersByTime(120_000));
    expect(off.result.current.offered).toBe(false);
    expect(pro.result.current.offered).toBe(false);
  });
});

describe('storage size', () => {
  it('reads like a person would say it', () => {
    expect(formatBytes(512)).toBe('1 KB');
    expect(formatBytes(300 * 1024)).toBe('300 KB');
    expect(formatBytes(12.34 * 1024 * 1024)).toBe('12,3 MB');
  });
});
