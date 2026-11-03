import {
  PrimaryButton,
  RewardBadge,
  SecondaryButton,
  Sheet,
  StarRow,
  Text,
  dialogStyles,
  spacing,
} from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';
import type { CompletionResult } from '@/store/progress';

export interface CelebrationProps {
  visible: boolean;
  total: number;
  result: CompletionResult | null;
  onAgain: () => void;
  onAtelier: () => void;
}

/** Finished puzzle: Pino celebrates – stars for the size, new milestones, no timer, no score pressure. */
export function Celebration({ visible, total, result, onAgain, onAtelier }: CelebrationProps) {
  return (
    <Sheet
      visible={visible}
      title={t('play.doneTitle')}
      emotion="success"
      onRequestClose={onAtelier}
      testID="puzzle-done"
    >
      <Text variant="bodyLarge" align="center">
        {t('play.doneBody', { total })}
      </Text>
      {result ? (
        <StarRow stars={result.stars} size={34} accessibilityLabel={t('play.doneStars', { stars: result.stars })} />
      ) : null}
      {result?.unlocked.map((a) => (
        <View key={a.id} style={styles.unlock} testID={`unlocked-${a.id}`}>
          <RewardBadge id={a.reward.id} size={48} />
          <Text variant="label" style={styles.unlockText}>
            {t('play.doneNew', { name: t(`ach.${a.id}` as MessageKey) })}
          </Text>
        </View>
      ))}
      <View style={dialogStyles.actions}>
        <PrimaryButton testID="done-atelier" label={t('play.doneAtelier')} onPress={onAtelier} />
        <SecondaryButton testID="done-again" label={t('play.doneAgain')} onPress={onAgain} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  unlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'stretch' },
  unlockText: { flex: 1 },
});
