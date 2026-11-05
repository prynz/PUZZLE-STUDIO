/**
 * PINO – the PUZZLE STUDIO mascot (single source of truth).
 *
 * Pure TypeScript (no React / React Native): returns an SVG string.
 *  - App:     <Mascot emotion="…" /> renders it via react-native-svg (SvgXml).
 *  - Mockups: scripts/design-preview imports the same function.
 *
 * Look since 2026-11-04 (PO concept art): a puffy, glossy jigsaw piece with four knobs, lime → teal
 * gradient, tiny dark eyes, a thin smile and neon-lime effects. Colors live in ./theme.ts.
 * Replacing the drawing later (e.g. final illustrations): keep `MascotEmotion` and `pinoSvg`.
 * See docs/design/mascot-guidelines.md → "Austauschbarkeit".
 */
import { mascotColors as C } from './theme.ts';

type EyeKind = 'open' | 'wink' | 'closed' | 'look-up' | 'wide' | 'happy' | 'proud';
type MouthKind = 'smile' | 'open' | 'o' | 'hmm' | 'tiny' | 'grin';
type ExtraKind = '' | 'sparkles' | 'pop' | 'question' | 'crown' | 'heart' | 'zzz' | 'ring';

interface EmotionSpec {
  label: string;
  eyes: EyeKind;
  mouth: MouthKind;
  extra: ExtraKind;
  /** Slight lean in degrees (the piece is never perfectly straight). */
  tilt: number;
}

/** Emotion → face and neon extra. */
export const MASCOT_EMOTIONS = {
  greeting: { label: 'Begrüßung', eyes: 'open', mouth: 'smile', extra: 'sparkles', tilt: -8 },
  happy: { label: 'Fröhlich', eyes: 'wink', mouth: 'open', extra: 'ring', tilt: -6 },
  thinking: { label: 'Nachdenklich', eyes: 'look-up', mouth: 'hmm', extra: 'question', tilt: -4 },
  surprised: { label: 'Überrascht', eyes: 'wide', mouth: 'o', extra: 'pop', tilt: -8 },
  excited: { label: 'Begeistert', eyes: 'happy', mouth: 'grin', extra: 'pop', tilt: -10 },
  success: { label: 'Geschafft!', eyes: 'proud', mouth: 'smile', extra: 'crown', tilt: -6 },
  encourage: { label: 'Ermutigung', eyes: 'happy', mouth: 'smile', extra: 'heart', tilt: -8 },
  sleeping: { label: 'Schläft', eyes: 'closed', mouth: 'tiny', extra: 'zzz', tilt: -12 },
  /** Parents' area: Pino keeps the grown-up settings safe. */
  guard: { label: 'Beschützt', eyes: 'proud', mouth: 'smile', extra: '', tilt: -6 },
} as const satisfies Record<string, EmotionSpec>;

export type MascotEmotion = keyof typeof MASCOT_EMOTIONS;
export const MASCOT_EMOTION_LIST = Object.keys(MASCOT_EMOTIONS) as MascotEmotion[];

/** Unique id prefix per rendered instance (gradients must not collide). */
let counter = 0;

/**
 * The piece: one smooth, puffy jigsaw outline – rounded body, four knobs (top, right, bottom,
 * left) with soft concave necks, so it reads like a squishy 3D toy and not like a flat cut-out.
 */
const PIECE_PATH =
  'M56 98 C56 76 72 64 96 64 L116 64 C123 64 123 56 118 50 C108 36 118 18 138 18 ' +
  'C158 18 168 36 158 50 C153 56 153 64 160 64 C176 64 188 76 188 96 L188 116 ' +
  'C188 123 196 123 202 118 C216 108 232 118 232 138 C232 158 216 168 202 158 ' +
  'C196 153 188 153 188 160 C188 180 176 190 156 190 L122 190 C115 190 115 198 120 204 ' +
  'C130 218 120 234 100 234 C80 234 70 218 80 204 C85 198 85 190 78 190 ' +
  'C66 190 56 180 56 164 L56 134 C56 127 48 127 42 132 C28 142 12 132 12 112 ' +
  'C12 92 28 82 42 92 C48 97 56 97 56 90 Z';
const PIECE = `<path d="${PIECE_PATH}"/>`;

function sparkle(cx: number, cy: number, r: number, fill: string): string {
  const k = r * 0.28;
  return `<path d="M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r}Z" fill="${fill}"/>`;
}

/** Neon stroke: a wide faint glow under a crisp line. */
function neon(d: string, width = 5): string {
  return (
    `<path d="${d}" fill="none" stroke="${C.neon}" stroke-opacity="0.35" stroke-width="${width * 2.6}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${C.neon}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

// ---- face --------------------------------------------------------------------------
const EL = 104;
const ER = 146;
const EY = 116;

function eye(x: number, kind: EyeKind, right: boolean): string {
  const oval = (dy = 0, s = 1) =>
    `<ellipse cx="${x}" cy="${EY + dy}" rx="${8.5 * s}" ry="${12 * s}" fill="${C.eye}"/>` +
    `<ellipse cx="${x - 2.5}" cy="${EY + dy - 5 * s}" rx="${2.6 * s}" ry="${3.2 * s}" fill="#fff" opacity="0.85"/>`;
  const arcUp = `<path d="M${x - 9} ${EY + 4} Q${x} ${EY - 7} ${x + 9} ${EY + 4}" fill="none" stroke="${C.eye}" stroke-width="5" stroke-linecap="round"/>`;
  const arcDown = `<path d="M${x - 9} ${EY} Q${x} ${EY + 8} ${x + 9} ${EY}" fill="none" stroke="${C.eye}" stroke-width="4.5" stroke-linecap="round"/>`;
  switch (kind) {
    case 'wink':
      return right ? arcUp : oval();
    case 'closed':
      return arcDown;
    case 'happy':
      return arcUp;
    case 'look-up':
      return (
        `<ellipse cx="${x}" cy="${EY}" rx="8.5" ry="12" fill="${C.eye}"/>` +
        `<ellipse cx="${x + 1}" cy="${EY - 6}" rx="2.4" ry="2.8" fill="#fff" opacity="0.85"/>`
      );
    case 'wide':
      return oval(0, 1.18);
    case 'proud':
      // confident: a straight brow line sits on the eye
      return (
        oval(2) +
        `<path d="M${x - 10} ${EY - 10 + (right ? 2 : -2)} L${x + 10} ${EY - 10 + (right ? -2 : 2)}" stroke="${C.eye}" stroke-width="4.5" stroke-linecap="round"/>`
      );
    default:
      return oval();
  }
}

function mouth(kind: MouthKind): string {
  const x = 125;
  const y = 144;
  switch (kind) {
    case 'open':
    case 'grin':
      return (
        `<path d="M${x - 13} ${y - 3} Q${x} ${y + 1} ${x + 13} ${y - 3} Q${x} ${y + (kind === 'grin' ? 20 : 15)} ${x - 13} ${y - 3}Z" fill="${C.mouth}"/>` +
        `<path d="M${x - 6} ${y + 6} Q${x} ${y + 3} ${x + 6} ${y + 6} Q${x} ${y + 10} ${x - 6} ${y + 6}Z" fill="${C.tongue}"/>`
      );
    case 'o':
      return `<ellipse cx="${x}" cy="${y + 3}" rx="6" ry="8" fill="${C.mouth}"/>`;
    case 'hmm':
      return `<path d="M${x - 7} ${y + 3} Q${x + 1} ${y} ${x + 8} ${y + 3}" stroke="${C.mouth}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'tiny':
      return `<path d="M${x - 5} ${y + 1} Q${x} ${y + 5} ${x + 5} ${y + 1}" stroke="${C.mouth}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M${x - 14} ${y - 2} Q${x} ${y + 12} ${x + 14} ${y - 2}" stroke="${C.mouth}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
}

function extra(kind: ExtraKind): string {
  switch (kind) {
    case 'sparkles':
      return sparkle(204, 40, 13, C.neon) + sparkle(222, 70, 7, C.neon);
    case 'pop':
      return neon('M196 30 L202 18') + neon('M208 40 L220 34') + neon('M186 26 L186 14');
    case 'question':
      return (
        neon('M200 36 Q200 24 211 24 Q222 24 222 34 Q222 42 212 46 L212 52', 4.5) +
        `<circle cx="212" cy="62" r="3.6" fill="${C.neon}"/>`
      );
    case 'crown':
      return neon('M110 26 L114 8 L123 20 L131 4 L139 20 L148 8 L152 26 Z', 4);
    case 'heart':
      return neon(
        'M212 66 C204 56 190 62 196 74 C199 80 212 88 212 88 C212 88 225 80 228 74 C234 62 220 56 212 66 Z',
        3.6,
      );
    case 'zzz':
      return neon('M176 34 H188 L176 48 H188', 4) + neon('M198 12 H214 L198 32 H214', 4.5);
    case 'ring':
      return '';
    default:
      return '';
  }
}

/** Glowing orbit ring – back half behind the piece, front half in front of it. */
function ring(front: boolean): string {
  const d = front ? 'M20 176 Q120 222 222 160' : 'M222 160 Q136 128 20 176';
  return neon(d, 3.4);
}

/**
 * Returns a self-contained SVG (viewBox 0 0 240 240, no width/height).
 * `idPrefix` must be unique per rendered instance (gradient ids).
 */
export function pinoSvg(emotion: MascotEmotion = 'greeting', idPrefix?: string): string {
  const e: EmotionSpec = MASCOT_EMOTIONS[emotion];
  const id = idPrefix ?? `pino${++counter}`;
  const hasRing = e.extra === 'ring';
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-body" gradientUnits="userSpaceOnUse" x1="40" y1="40" x2="206" y2="214">
      <stop offset="0" stop-color="${C.lime}"/><stop offset="0.32" stop-color="${C.limeDeep}"/>
      <stop offset="0.66" stop-color="${C.green}"/><stop offset="1" stop-color="${C.teal}"/>
    </linearGradient>
    <radialGradient id="${id}-shine" gradientUnits="userSpaceOnUse" cx="86" cy="78" r="78">
      <stop offset="0" stop-color="#fff" stop-opacity="0.62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-shade" gradientUnits="userSpaceOnUse" cx="176" cy="196" r="96">
      <stop offset="0" stop-color="${C.shade}" stop-opacity="0.42"/><stop offset="1" stop-color="${C.shade}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.shadow}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.shadow}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}-clip">${PIECE}</clipPath>
  </defs>
  <ellipse cx="122" cy="226" rx="84" ry="12" fill="url(#${id}-glow)"/>
  ${hasRing ? ring(false) : ''}
  <g transform="translate(122 130) scale(0.86) rotate(${e.tilt}) translate(-122 -124)">
    <g fill="${C.halo}" opacity="0.28" transform="translate(122 124) scale(1.05) translate(-122 -124)">${PIECE}</g>
    <g fill="url(#${id}-body)">${PIECE}</g>
    <g clip-path="url(#${id}-clip)">
      <rect x="0" y="0" width="240" height="240" fill="url(#${id}-shade)"/>
      <rect x="0" y="0" width="240" height="240" fill="url(#${id}-shine)"/>
    </g>
    <ellipse cx="82" cy="80" rx="22" ry="9" transform="rotate(-32 82 80)" fill="#fff" opacity="0.4"/>
    <ellipse cx="132" cy="34" rx="10" ry="5" transform="rotate(-20 132 34)" fill="#fff" opacity="0.35"/>
    ${eye(EL, e.eyes, false)}
    ${eye(ER, e.eyes, true)}
    ${mouth(e.mouth)}
  </g>
  ${hasRing ? ring(true) : ''}
  ${extra(e.extra)}
</svg>`;
}
