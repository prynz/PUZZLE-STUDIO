import { LoadingScreen } from '@puzzle-studio/ui';
import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { StartupGate } from '@/features/startup/StartupGate';
import { STARTUP_MIN_MS, shownProgress, startupFinished } from '@/features/startup/startupProgress';
import { t } from '@/i18n';
import { AppProviders } from '@/testing/AppProviders';

jest.mock('@/services/preload', () => ({
  PRELOAD_TASKS: [{ key: 'test', run: () => Promise.resolve() }],
}));

describe('start screen timing', () => {
  it('never shows more than is really done and fills evenly over the minimum time', () => {
    expect(shownProgress(1, 0)).toBe(0);
    expect(shownProgress(1, STARTUP_MIN_MS / 2)).toBeCloseTo(0.5);
    expect(shownProgress(0.25, STARTUP_MIN_MS)).toBe(0.25); // slow loading: real share wins
    expect(shownProgress(1, STARTUP_MIN_MS * 3)).toBe(1);
  });

  it('finishes only when everything is loaded AND the minimum time has passed', () => {
    expect(STARTUP_MIN_MS).toBeGreaterThanOrEqual(4000);
    expect(STARTUP_MIN_MS).toBeLessThanOrEqual(5000);
    expect(startupFinished(1, STARTUP_MIN_MS - 1)).toBe(false);
    expect(startupFinished(0.9, STARTUP_MIN_MS * 2)).toBe(false);
    expect(startupFinished(1, STARTUP_MIN_MS)).toBe(true);
  });
});

describe('loading screen', () => {
  it('without real progress: no made-up percentage, announced as busy', async () => {
    await render(<LoadingScreen testID="loading" title={t('loading.title')} message={t('play.loading')} />);
    expect(screen.getByText('Wird geladen …')).toBeTruthy();
    expect(screen.getByTestId('loading').props.accessibilityState).toEqual({ busy: true });
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('with real progress: shows the percentage', async () => {
    await render(<LoadingScreen title={t('loading.title')} message={t('loading.start')} progress={0.72} />);
    expect(screen.getByTestId('loading-percent').props.children).toBe('72 %');
  });
});

describe('app start preloader', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the start screen at least 4.5 s, then opens the first screen', async () => {
    await render(
      <AppProviders>
        <StartupGate>
          <Text>erster Screen</Text>
        </StartupGate>
      </AppProviders>,
    );
    expect(screen.getByTestId('startup')).toBeTruthy();
    expect(screen.getByText(t('loading.start'))).toBeTruthy();
    await act(async () => jest.advanceTimersByTime(STARTUP_MIN_MS - 500));
    expect(screen.queryByText('erster Screen')).toBeNull();
    await act(async () => jest.advanceTimersByTime(700));
    // the first screen is there; the start screen fades out on top of it, then disappears
    expect(screen.getByText('erster Screen')).toBeTruthy();
    await act(async () => jest.advanceTimersByTime(1000));
    expect(screen.queryByTestId('startup')).toBeNull();
  });
});
