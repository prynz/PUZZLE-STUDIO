import { createMemorySettingsStore } from '@/storage/settingsStore';
import { DEFAULT_PROFILE, parseSettings } from '@/store/settings';

describe('settings', () => {
  it('falls back to safe defaults for missing or invalid values', () => {
    expect(parseSettings({})).toEqual({ onboardingCompleted: false, profile: DEFAULT_PROFILE });
    expect(parseSettings({ 'play.profile': 'admin', 'onboarding.completed': 'yes' })).toEqual({
      onboardingCompleted: false,
      profile: DEFAULT_PROFILE,
    });
  });

  it('reads stored values', () => {
    expect(parseSettings({ 'play.profile': 'toddler', 'onboarding.completed': true })).toEqual({
      onboardingCompleted: true,
      profile: 'toddler',
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
