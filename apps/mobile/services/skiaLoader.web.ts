import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

/**
 * Web: Skia runs on CanvasKit (WebAssembly). `canvaskit.wasm` is copied into
 * `public/` by `setup-skia-web` (see the `web` / `export:web` scripts).
 * Skia modules must only be imported AFTER this resolves.
 */
export async function loadSkia(): Promise<void> {
  await LoadSkiaWeb({ locateFile: (file: string) => `/${file}` });
}
