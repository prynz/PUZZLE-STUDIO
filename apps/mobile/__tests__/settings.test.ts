import { createMemorySettingsStore } from '@/storage/settingsStore';
import { DEFAULT_PARENT_OPTIONS, DEFAULT_PROFILE, parseSettings } from '@/store/settings';

describe('settings', () => {
  it('falls back to safe defaults for missing or invalid values', () => {
    const defaults = {
      onboardingCompleted: false,
      profile: DEFAULT_PROFILE,
      boardBackground: null,
      cardFrame: null,
      parent: DEFAULT_PARENT_OPTIONS,
    };
    expect(parseSettings({})).toEqual(defaults);
    expect(
      parseSettings({
        'play.profile': 'admin',
        'onboarding.completed': 'yes',
        'reward.background': 3,
        'reward.frame': '',
        'parent.options': { misplace: 'explode', reference: 'no', hintOffers: 1 },
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
        'parent.options': { misplace: 'return', reference: false, hintOffers: false, reduceMotion: true },
      }),
    ).toEqual({
      onboardingCompleted: true,
      profile: 'toddler',
      boardBackground: 'background_meadow',
      cardFrame: 'frame_sun',
      parent: { misplace: 'return', reference: false, hintOffers: false, reduceMotion: true },
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
