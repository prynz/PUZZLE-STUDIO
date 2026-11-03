import {
  Appear,
  Mascot,
  PrimaryButton,
  RewardBadge,
  SecondaryButton,
  Sheet,
  Sparkles,
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

const STAR_DELAY = 250;
const STAR_STEP = 260;

/**
 * Finished puzzle: Pino celebrates with twinkling stars, the earned stars pop in one after
 * another, then new milestones – calm, no timer, no score pressure. Static with Reduced Motion.
 */
export function Celebration({ visible, total, result, onAgain, onAtelier }: CelebrationProps) {
  return (
    <Sheet
      visible={visible}
      title={t('play.doneTitle')}
      hero={
        <Sparkles>
          <Mascot emotion="success" size={96} animated accessibilityLabel={null} />
        </Sparkles>
      }
      onRequestClose={onAtelier}
      testID="puzzle-done"
    >
      <Text variant="bodyLarge" align="center">
        {t('play.doneBody', { total })}
      </Text>
      {result ? (
        <StarRow
          stars={result.stars}
          size={38}
          animated
          delay={STAR_DELAY}
          accessibilityLabel={t('play.doneStars', { stars: result.stars })}
        />
      ) : null}
      {result?.unlocked.map((a, i) => (
        <Appear
          key={a.id}
          variant="pop"
          delay={STAR_DELAY + result.stars * STAR_STEP + 150 + i * 160}
          style={styles.unlock}
        >
          <View style={styles.row} testID={`unlocked-${a.id}`}>
            <RewardBadge id={a.reward.id} size={48} />
            <Text variant="label" style={styles.unlockText}>
              {t('play.doneNew', { name: t(`ach.${a.id}` as MessageKey) })}
            </Text>
          </View>
        </Appear>
      ))}
      <View style={dialogStyles.actions}>
        <PrimaryButton testID="done-atelier" label={t('play.doneAtelier')} onPress={onAtelier} />
        <SecondaryButton testID="done-again" label={t('play.doneAgain')} onPress={onAgain} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  unlock: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unlockText: { flex: 1 },
});
