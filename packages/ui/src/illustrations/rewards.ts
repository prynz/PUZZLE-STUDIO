/**
 * Looks of the rewards (ids from @puzzle-studio/game-progression). Central, so final artwork can
 * replace these interim drawings without touching screens (mascot/styles are not final yet).
 */
import { palette as P } from '../tokens.ts';
import type { BackgroundPreset } from './backgrounds.ts';
import { starPath } from './svg.ts';

export interface FrameLook {
  outer: string;
  inner: string;
}

export const FRAME_LOOKS: Record<string, FrameLook> = {
  frame_sun: { outer: P.yellow600, inner: P.yellow100 },
  frame_rainbow: { outer: P.purple, inner: P.sky },
  frame_gold: { outer: P.yellow700, inner: P.cream300 },
};

export const BACKGROUND_LOOKS: Record<string, BackgroundPreset> = {
  background_meadow: 'meadow',
  background_sky: 'sky',
  background_dream: 'dream',
};

const sticker = (body: string) => `<svg width="80" height="80" viewBox="0 0 80 80">${body}</svg>`;

/** Sticker drawings (SVG) – the "wave" sticker is Pino himself (rendered via <Mascot>). */
export const STICKER_SVGS: Record<string, string> = {
  sticker_star: sticker(
    `<circle cx="40" cy="40" r="36" fill="${P.yellow100}"/><polygon points="${starPath(40, 41, 26, 0.5)}" fill="${P.yellow}" stroke="${P.yellow700}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  sticker_heart: sticker(
    `<circle cx="40" cy="40" r="36" fill="${P.pink}"/><path d="M40 62 C14 46 16 22 31 22 C36 22 39 26 40 29 C41 26 44 22 49 22 C64 22 66 46 40 62Z" fill="${P.peach}" stroke="${P.peach600}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  sticker_trophy: sticker(
    `<circle cx="40" cy="40" r="36" fill="${P.lavender100}"/><path d="M27 18 H53 V30 A13 13 0 0 1 27 30Z" fill="${P.yellow}" stroke="${P.yellow700}" stroke-width="3"/><path d="M27 22 H19 Q19 34 29 35 M53 22 H61 Q61 34 51 35" fill="none" stroke="${P.yellow700}" stroke-width="3"/><path d="M36 43 H44 V52 H36Z" fill="${P.yellow600}"/><rect x="28" y="52" width="24" height="8" rx="3" fill="${P.purple}"/>`,
  ),
};

export const starIcon = (filled: boolean, size = 22): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="${starPath(12, 12.5, 10, 0.5)}" fill="${filled ? P.yellow : P.lavender100}" stroke="${filled ? P.yellow700 : P.greyPurple300}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
