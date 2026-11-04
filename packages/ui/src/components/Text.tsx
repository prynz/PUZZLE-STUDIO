import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { textStyle } from '../styles/helpers.ts';
import { color as colorTokens, typography } from '../tokens.ts';

export type TextVariant = keyof typeof typography;
export type TextTone = 'primary' | 'secondary' | 'onPrimary' | 'brand';

const toneColor: Record<TextTone, string> = {
  primary: colorTokens.text.primary,
  secondary: colorTokens.text.secondary,
  onPrimary: colorTokens.text.onPrimary,
  brand: colorTokens.brand.strong,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'auto' | 'left' | 'center' | 'right';
}

/** The only text primitive used in screens. Maps typography tokens → Nunito faces. */
export function Text({ variant = 'body', tone, align = 'auto', style, ...rest }: TextProps) {
  const defaultTone: TextTone =
    variant === 'body' || variant === 'bodyLarge' || variant === 'caption' ? 'secondary' : 'primary';
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[textStyle(typography[variant], toneColor[tone ?? defaultTone]), { textAlign: align }, style]}
    />
  );
}
