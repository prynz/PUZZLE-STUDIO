import { Mascot, SecondaryButton, SpeechBubble, Text, spacing } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

export type PinoSays = 'cheer' | 'hint' | 'offer';

export interface PinoBubbleProps {
  says: PinoSays;
  /** Only for `offer`: the child accepts or waves it away. */
  onAccept?: () => void;
  onDismiss?: () => void;
}

const TEXT = { cheer: 'play.biteDone', hint: 'play.hintSay', offer: 'play.offerSay' } as const;

/** Pino above the board: cheers, explains a hint or offers one by himself (never forces it). */
export function PinoBubble({ says, onAccept, onDismiss }: PinoBubbleProps) {
  return (
    // only the offer has buttons – otherwise touches go straight through to the board
    <View style={styles.pino} testID={`pino-${says}`} pointerEvents={says === 'offer' ? 'box-none' : 'none'}>
      <Mascot emotion={says === 'cheer' ? 'excited' : 'happy'} size={64} accessibilityLabel={null} />
      <SpeechBubble>
        <Text variant="label" accessibilityLiveRegion="polite">
          {t(TEXT[says])}
        </Text>
        {says === 'offer' && onAccept && onDismiss ? (
          <View style={styles.actions}>
            <SecondaryButton size="compact" testID="offer-yes" label={t('play.offerYes')} onPress={onAccept} />
            <SecondaryButton size="compact" testID="offer-no" label={t('play.offerNo')} onPress={onDismiss} />
          </View>
        ) : null}
      </SpeechBubble>
    </View>
  );
}

const styles = StyleSheet.create({
  pino: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
});
