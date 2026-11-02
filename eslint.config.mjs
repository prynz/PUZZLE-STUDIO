// @ts-check
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier/flat';

const RAW_COLOR = String.raw`/^(#[0-9a-fA-F]{3,8}|rgba?\(.*\)|hsla?\(.*\)|white|black)$/`;

// Reanimated layout animations can stay invisible when system animations are
// disabled (found on Android CI). Use <Appear> from @puzzle-studio/ui instead.
const NO_LAYOUT_ANIMATION = {
  selector: 'JSXAttribute[name.name=/^(entering|exiting)$/]',
  message: 'Keine Reanimated-Layout-Animationen (entering/exiting) – <Appear> aus @puzzle-studio/ui verwenden.',
};

export default defineConfig([
  expoConfig,
  prettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      'apps/mobile/public/**',
      'apps/mobile/expo-env.d.ts',
      // concept-mockup renderer (Node/HTML strings, not app code)
      'scripts/design-preview/**',
    ],
  },
  {
    settings: {
      'import/resolver': { typescript: { project: ['apps/mobile/tsconfig.json', 'packages/*/tsconfig.json'] } },
    },
  },
  // Design system rule: screens and features never define raw colors.
  {
    files: ['apps/mobile/app/**/*.{ts,tsx}', 'apps/mobile/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${RAW_COLOR}]`,
          message: 'Keine Roh-Farben in Screens – Tokens aus @puzzle-studio/ui verwenden.',
        },
        NO_LAYOUT_ANIMATION,
      ],
    },
  },
  {
    files: ['packages/ui/src/**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', NO_LAYOUT_ANIMATION] },
  },
  // Pure modules (tokens, mascot, illustrations, image-processing): no React / RN / Expo imports.
  {
    files: [
      'packages/ui/src/tokens.ts',
      'packages/ui/src/mascot/**/*.ts',
      'packages/ui/src/illustrations/**/*.ts',
      'packages/image-processing/src/**/*.ts',
      'packages/puzzle-engine/src/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['react', 'react-native', 'react-native-*', 'expo', 'expo-*'] }],
    },
  },
]);
