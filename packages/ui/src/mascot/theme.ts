import { palette } from '../tokens.ts';

/**
 * Pino's colors. Adjusting the mascot's look later starts here.
 * Values outside the UI palette are mascot-specific shades.
 *
 * Style since 2026-11-04 (PO reference): soft 3D, glossy, fresh mint – light from the top left,
 * a deeper green underside, a big soft highlight and a green glow instead of a grey shadow.
 */
export const mascotColors = {
  bodyLight: '#F1FFF4',
  body: palette.leaf,
  bodyDark: palette.leaf600,
  /** Very soft edge (no hard outline). */
  outline: palette.leaf700,
  underside: palette.leaf700,
  foot: '#5FB887',
  eye: palette.ink,
  cheek: '#FF8AA3',
  mouth: '#24392F',
  tongue: '#FF9C8A',
  /** Signature star clip on the head and sparkles. */
  star: palette.yellow,
  starDark: palette.leaf700,
  peach: palette.peach,
  glow: palette.leaf600,
} as const;
