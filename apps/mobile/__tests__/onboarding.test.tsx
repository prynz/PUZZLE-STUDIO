import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { createMemorySettingsStore } from '@/storage/settingsStore';
import { SettingsProvider } from '@/store/settings';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }) }));

const renderOnboarding = async (store = createMemorySettingsStore()) => {
  await render(
    <SettingsProvider store={store}>
      <OnboardingScreen />
    </SettingsProvider>,
  );
  return store;
};

describe('Onboarding', () => {
  beforeEach(() => mockReplace.mockClear());

  it('walks through 3 steps and stores the chosen play-help profile', async () => {
    const store = await renderOnboarding();
    expect(screen.getByText('Hallo, ich bin Pino!')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onb-next'));
    expect(screen.getByText('Erstellen, puzzeln, sammeln')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onb-next'));
    expect(screen.getByText('Wer puzzelt?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('profile-pro'));
    expect(screen.getByTestId('profile-pro').props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByTestId('onb-finish'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/home'));
    expect(await store.getAll()).toEqual({ 'play.profile': 'pro', 'onboarding.completed': true });
  });

  it('can be skipped (default profile)', async () => {
    const store = await renderOnboarding();
    await fireEvent.press(screen.getByTestId('onb-skip'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/home'));
    expect(await store.getAll()).toEqual({ 'play.profile': 'kid', 'onboarding.completed': true });
  });
});
