import { palette } from '../tokens.ts';

/**
 * Pino's colors. Adjusting the mascot's look later starts here.
 * Values outside the UI palette are mascot-specific shades.
 */
export const mascotColors = {
  bodyLight: '#FFF0B8',
  body: palette.yellow,
  bodyDark: palette.yellow600,
  outline: '#E9A93C',
  foot: '#F3B94A',
  eye: palette.navy,
  cheek: '#FFA996',
  mouth: '#5A3D52',
  tongue: '#FF9C8A',
  star: palette.lavender,
  starDark: palette.purple,
  peach: palette.peach,
  shadow: palette.navy,
} as const;
