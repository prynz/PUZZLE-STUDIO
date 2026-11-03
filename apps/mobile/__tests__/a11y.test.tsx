import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';

import { AwardsScreen } from '@/features/awards/AwardsScreen';
import { CollectionScreen } from '@/features/collection/CollectionScreen';
import { CreateScreen } from '@/features/creator/CreateScreen';
import { SamplesScreen } from '@/features/creator/SamplesScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { ParentsScreen } from '@/features/parents/ParentsScreen';
import { NUMBER_WORDS } from '@/features/parents/gate';
import { auditTouchables, touchableCount } from '@/testing/a11yAudit';
import { AppProviders } from '@/testing/AppProviders';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

const SCREENS: [string, ComponentType][] = [
  ['Onboarding', OnboardingScreen],
  ['Start', HomeScreen],
  ['Atelier', CreateScreen],
  ['Beispielbilder', SamplesScreen],
  ['Sammlung', CollectionScreen],
  ['Erfolge', AwardsScreen],
  ['Eltern-Schranke', ParentsScreen],
];

describe('accessibility audit', () => {
  it('finds touchables without role or spoken name', async () => {
    await render(
      <View>
        <Pressable testID="silent" onPress={() => undefined} />
      </View>,
    );
    expect(auditTouchables(screen.root)).toEqual([
      { testID: 'silent', problem: 'no role' },
      { testID: 'silent', problem: 'no spoken name' },
    ]);
  });
});

describe('accessibility: every touchable has a role and a spoken name', () => {
  it.each(SCREENS)('%s', async (_, Screen) => {
    await render(
      <AppProviders data={{ settings: { 'onboarding.completed': true } }}>
        <Screen />
      </AppProviders>,
    );
    expect(touchableCount(screen.root)).toBeGreaterThan(0);
    expect(auditTouchables(screen.root)).toEqual([]);
  });

  it('Elternbereich (all three areas)', async () => {
    await render(
      <AppProviders>
        <ParentsScreen />
      </AppProviders>,
    );
    const words = String(screen.getByTestId('gate-task').props.children).split(' · ');
    for (const w of words) {
      await fireEvent.press(screen.getByTestId(`gate-digit-${(NUMBER_WORDS as readonly string[]).indexOf(w) + 1}`));
    }
    for (const area of ['play', 'data', 'info']) {
      await fireEvent.press(screen.getByTestId(`parents-${area}`));
      expect(auditTouchables(screen.root)).toEqual([]);
    }
  });
});
