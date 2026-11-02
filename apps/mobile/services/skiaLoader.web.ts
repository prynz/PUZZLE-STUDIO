import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import Constants from 'expo-constants';

/**
 * Web: Skia runs on CanvasKit (WebAssembly). `canvaskit.wasm` is copied into
 * `public/` by `setup-skia-web` (see the `web` / `export:web` scripts).
 * Skia modules must only be imported AFTER this resolves.
 * The wasm is resolved relative to the configured base URL (e.g. GitHub Pages sub-path).
 */
export async function loadSkia(): Promise<void> {
  const baseUrl = (Constants.expoConfig?.experiments?.baseUrl ?? '').replace(/\/$/, '');
  await LoadSkiaWeb({ locateFile: (file: string) => `${baseUrl}/${file}` });
}
