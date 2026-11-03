import type { ExpoConfig } from 'expo/config';

const load = (variant?: string): ExpoConfig => {
  jest.resetModules();
  if (variant === undefined) delete process.env.APP_VARIANT;
  else process.env.APP_VARIANT = variant;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- re-evaluate config per variant
  const factory = require('../app.config').default as (ctx: { config: Partial<ExpoConfig> }) => ExpoConfig;
  return factory({ config: {} });
};

describe('app.config', () => {
  afterAll(() => {
    delete process.env.APP_VARIANT;
  });

  it('uses the store identifiers for production', () => {
    const c = load();
    expect(c.ios?.bundleIdentifier).toBe('com.puzzlestudio.app');
    expect(c.android?.package).toBe('com.puzzlestudio.app');
    expect(c.name).toBe('Puzzle Studio');
  });

  it('separates development and preview builds', () => {
    expect(load('development').android?.package).toBe('com.puzzlestudio.app.dev');
    expect(load('preview').ios?.bundleIdentifier).toBe('com.puzzlestudio.app.preview');
  });

  it('blocks privacy-sensitive Android permissions', () => {
    const blocked = load().android?.blockedPermissions ?? [];
    for (const p of ['RECORD_AUDIO', 'READ_MEDIA_IMAGES', 'ACCESS_FINE_LOCATION']) {
      expect(blocked).toContain(`android.permission.${p}`);
    }
  });

  it('never requests photo library or microphone access on iOS', () => {
    const picker = (load().plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'expo-image-picker');
    expect(picker).toBeDefined();
    const opts = (picker as [string, Record<string, unknown>])[1];
    expect(opts['photosPermission']).toBe(false);
    expect(opts['microphonePermission']).toBe(false);
  });
  it('keeps photos and play data out of the automatic Google backup', () => {
    expect(load().android?.allowBackup).toBe(false);
  });
});
