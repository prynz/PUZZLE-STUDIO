import { createMemorySettingsStore } from '@/storage/settingsStore';
import { DEFAULT_PROFILE, parseSettings } from '@/store/settings';

describe('settings', () => {
  it('falls back to safe defaults for missing or invalid values', () => {
    const defaults = { onboardingCompleted: false, profile: DEFAULT_PROFILE, boardBackground: null, cardFrame: null };
    expect(parseSettings({})).toEqual(defaults);
    expect(
      parseSettings({
        'play.profile': 'admin',
        'onboarding.completed': 'yes',
        'reward.background': 3,
        'reward.frame': '',
      }),
    ).toEqual(defaults);
  });

  it('reads stored values', () => {
    expect(
      parseSettings({
        'play.profile': 'toddler',
        'onboarding.completed': true,
        'reward.background': 'background_meadow',
        'reward.frame': 'frame_sun',
      }),
    ).toEqual({
      onboardingCompleted: true,
      profile: 'toddler',
      boardBackground: 'background_meadow',
      cardFrame: 'frame_sun',
    });
  });

  it('memory store round-trips values', async () => {
    const store = createMemorySettingsStore();
    await store.set('a', { x: 1 });
    expect(await store.getAll()).toEqual({ a: { x: 1 } });
    await store.remove('a');
    expect(await store.getAll()).toEqual({});
  });
});
