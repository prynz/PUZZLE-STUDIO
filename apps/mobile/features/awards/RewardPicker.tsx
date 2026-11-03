import { unlockedRewards, type RewardKind } from '@puzzle-studio/game-progression';
import { RewardBadge, SelectionCard, Text, spacing } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';

export interface RewardPickerProps {
  kind: Exclude<RewardKind, 'sticker'>;
  title: string;
  unlocked: ReadonlySet<string>;
  /** Currently applied reward id (null = standard look). */
  value: string | null;
  onChange: (id: string | null) => void;
}

/** Choose an unlocked frame or background – "Standard" is always available. */
export function RewardPicker({ kind, title, unlocked, value, onChange }: RewardPickerProps) {
  const rewards = unlockedRewards(unlocked, kind);
  return (
    <View style={styles.wrap}>
      <Text variant="title3" accessibilityRole="header">
        {title}
      </Text>
      <SelectionCard
        testID={`${kind}-default`}
        title={t('awards.default')}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {rewards.map((r) => (
        <SelectionCard
          key={r.id}
          testID={`reward-${r.id}`}
          title={t(`reward.${r.id}` as MessageKey)}
          illustration={<RewardBadge id={r.id} size={56} />}
          selected={value === r.id}
          onPress={() => onChange(r.id)}
        />
      ))}
      {rewards.length === 0 ? <Text variant="caption">{t('awards.lockedRewards')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.sm } });
