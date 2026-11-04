import { View } from 'react-native';

import { color, palette, radius, spacing } from '../tokens.ts';
import { Text } from './Text.tsx';

export type Status = 'ok' | 'fail' | 'pending' | 'unsupported';

const tones: Record<Status, { bg: string; fg: string }> = {
  ok: { bg: color.feedback.successSurface, fg: palette.ink },
  fail: { bg: color.feedback.gentleErrorSurface, fg: palette.ink },
  pending: { bg: color.surface.leaf, fg: color.brand.strong },
  unsupported: { bg: color.background.sunken, fg: color.text.secondary },
};

const dots: Record<Status, string> = {
  ok: color.feedback.success,
  fail: color.feedback.gentleError,
  pending: color.brand.soft,
  unsupported: palette.slate300,
};

/** Small status badge (gentle colors, never alarm red). */
export function StatusPill({ status, label }: { status: Status; label: string }) {
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs + 2,
        backgroundColor: tones[status].bg,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dots[status] }} />
      <Text variant="caption" style={{ color: tones[status].fg }}>
        {label}
      </Text>
    </View>
  );
}
