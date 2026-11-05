// Thin wrapper: the mascot itself lives in packages/ui/src/mascot (single source of truth for
// app and mockups). Delivered artwork (PNG) wins over the vector drawing, exactly like <Mascot>.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MASCOT_ART_FILES } from '../../packages/ui/src/mascot/art.ts';
import { MASCOT_EMOTIONS, pinoSvg } from '../../packages/ui/src/mascot/pino.ts';

export const EMOTIONS = MASCOT_EMOTIONS;

const artDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../packages/ui/assets/mascot');

/** HTML element (artwork <img> or <svg>) with size, accessible label and optional inline style. */
export function mascot({ emotion = 'greeting', size = 200, style = '' } = {}) {
  const label = `Pino – ${MASCOT_EMOTIONS[emotion].label}`;
  const file = MASCOT_ART_FILES[emotion];
  if (file) {
    const data = readFileSync(resolve(artDir, file)).toString('base64');
    return `<img class="mascot" alt="${label}" width="${size}" height="${size}" style="object-fit:contain;${style}" src="data:image/png;base64,${data}"/>`;
  }
  return pinoSvg(emotion).replace(
    '<svg ',
    `<svg class="mascot" role="img" aria-label="${label}" width="${size}" height="${size}" style="${style}" `,
  );
}
