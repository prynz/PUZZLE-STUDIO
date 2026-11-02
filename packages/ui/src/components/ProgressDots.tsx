import { View } from 'react-native';

import { color, palette, radius, spacing } from '../tokens.ts';

export interface ProgressDotsProps {
  count: number;
  active: number;
  /** Spoken as "Schritt 2 von 3" – pass a localized string. */
  accessibilityLabel: string;
}

/** Onboarding-style step dots: active dot is a wider purple pill. */
export function ProgressDots({ count, active, accessibilityLabel }: ProgressDotsProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: count, now: active + 1 }}
      style={{ flexDirection: 'row', gap: spacing.xs + 2, justifyContent: 'center' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 28 : 10,
            height: 10,
            borderRadius: radius.pill,
            backgroundColor: i === active ? color.brand.purple : palette.lavender200,
          }}
        />
      ))}
    </View>
  );
}
