import type { MascotEmotion } from './pino.ts';

/**
 * Pino artwork delivered by the PO (transparent PNGs in packages/ui/assets/mascot/, derived from
 * the untouched originals in docs/design/mascot-art/). Emotions listed here show the artwork;
 * all others still use the vector drawing from pino.ts until their artwork arrives.
 * Pure data (no React Native) so the design-preview scripts can use it too.
 */
export const MASCOT_ART_FILES: Partial<Record<MascotEmotion, string>> = {
  greeting: 'greeting.png',
  thinking: 'thinking.png',
};
