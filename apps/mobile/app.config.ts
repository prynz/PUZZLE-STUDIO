import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Build variants (set via EAS build profile env `APP_VARIANT`):
 *  - development: dev client, separate bundle id so it can live next to the store app
 *  - preview:     internal test builds (APK / ad-hoc)
 *  - production:  store builds
 *
 * NOTE: the bundle identifier is permanent after the first store upload.
 * Confirm `com.puzzlestudio.app` before the first production build.
 */
type Variant = 'development' | 'preview' | 'production';

const variant: Variant =
  process.env.APP_VARIANT === 'development' || process.env.APP_VARIANT === 'preview'
    ? process.env.APP_VARIANT
    : 'production';

const BASE_ID = 'com.puzzlestudio.app';
const suffix = variant === 'production' ? '' : `.${variant === 'development' ? 'dev' : 'preview'}`;
const nameSuffix = variant === 'production' ? '' : variant === 'development' ? ' (Dev)' : ' (Preview)';

// Brand colors duplicated here on purpose: app.config is evaluated by Node
// before Metro, so it cannot import the token package. Keep in sync with
// packages/ui/src/tokens.ts (palette.cream).
const CREAM = '#FFF8ED';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `Puzzle Studio${nameSuffix}`,
  slug: 'puzzle-studio',
  scheme: 'puzzlestudio',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/brand/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: CREAM,
  ios: {
    bundleIdentifier: `${BASE_ID}${suffix}`,
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: `${BASE_ID}${suffix}`,
    adaptiveIcon: {
      backgroundColor: CREAM,
      foregroundImage: './assets/brand/android-icon-foreground.png',
      backgroundImage: './assets/brand/android-icon-background.png',
      monochromeImage: './assets/brand/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Privacy: the system photo picker needs no media permission and we never
    // record audio. Block permissions that libraries might merge in.
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ],
  },
  web: {
    favicon: './assets/brand/favicon.png',
    output: 'single',
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        image: './assets/brand/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: CREAM,
      },
    ],
    'expo-font',
    'expo-sqlite',
    [
      'expo-image-picker',
      {
        cameraPermission: 'Puzzle Studio braucht die Kamera, damit du ein Foto für dein Puzzle aufnehmen kannst.',
        photosPermission: false,
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Web preview hosted under a sub-path (GitHub Pages: /<repo>/). Unset for native builds and local dev.
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
  extra: {
    variant,
  },
});
