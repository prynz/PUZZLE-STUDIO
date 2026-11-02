// Thin wrapper: the mascot itself lives in packages/ui/src/mascot/pino.ts
// (single source of truth for app and mockups).
import { MASCOT_EMOTIONS, pinoSvg } from '../../packages/ui/src/mascot/pino.ts';

export const EMOTIONS = MASCOT_EMOTIONS;

/** HTML <svg> with size, accessible label and optional inline style. */
export function mascot({ emotion = 'greeting', size = 200, style = '' } = {}) {
  return pinoSvg(emotion).replace(
    '<svg ',
    `<svg class="mascot" role="img" aria-label="Pino – ${MASCOT_EMOTIONS[emotion].label}" width="${size}" height="${size}" style="${style}" `,
  );
}
