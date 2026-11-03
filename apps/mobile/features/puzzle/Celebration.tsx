import { PrimaryButton, SecondaryButton, Sheet, Text, dialogStyles } from '@puzzle-studio/ui';
import { View } from 'react-native';

import { t } from '@/i18n';

/** Finished puzzle: Pino celebrates – calm, no timer, no score pressure. */
export function Celebration(props: { visible: boolean; total: number; onAgain: () => void; onAtelier: () => void }) {
  return (
    <Sheet
      visible={props.visible}
      title={t('play.doneTitle')}
      emotion="success"
      onRequestClose={props.onAtelier}
      testID="puzzle-done"
    >
      <Text variant="bodyLarge" align="center">
        {t('play.doneBody', { total: props.total })}
      </Text>
      <View style={dialogStyles.actions}>
        <PrimaryButton testID="done-atelier" label={t('play.doneAtelier')} onPress={props.onAtelier} />
        <SecondaryButton testID="done-again" label={t('play.doneAgain')} onPress={props.onAgain} />
      </View>
    </Sheet>
  );
}
