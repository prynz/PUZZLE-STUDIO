import type { TextStyle, ViewStyle } from 'react-native';

import { fontFace, type ShadowToken, type TextStyleToken, color } from '../tokens.ts';

/** Converts a shadow token into a cross-platform `boxShadow` (RN ≥ 0.76, New Architecture). */
export function shadowStyle(token: ShadowToken): ViewStyle {
  if (token.opacity === 0) return {};
  return {
    boxShadow: `0px ${token.offsetY}px ${token.blur}px rgba(30, 45, 38, ${token.opacity})`,
  };
}

/** Converts a typography token into a RN text style using the weight-specific font face. */
export function textStyle(token: TextStyleToken, textColor: string = color.text.primary): TextStyle {
  return {
    fontFamily: fontFace[token.fontWeight],
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    color: textColor,
  };
}

/** `#RRGGBB` + alpha (0..1) → `rgba(r, g, b, a)`. Use with palette tokens only. */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`withAlpha expects #RRGGBB, got ${hex}`);
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h ?? '0', 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
