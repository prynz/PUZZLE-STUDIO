import { View, type ViewProps } from 'react-native';

import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';

export type SurfaceTone = keyof typeof color.surface | 'raised';

export interface SurfaceProps extends ViewProps {
  tone?: SurfaceTone;
  elevated?: boolean;
}

/** Base card surface: soft radius, white rim, gentle navy-tinted shadow. */
export function Surface({ tone = 'raised', elevated = true, style, ...rest }: SurfaceProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tone === 'raised' ? color.background.raised : color.surface[tone],
          borderRadius: radius.lg,
          borderWidth: 2,
          borderColor: color.border.card,
          padding: spacing.md,
        },
        elevated ? shadowStyle(shadow.card) : null,
        style,
      ]}
    />
  );
}
