import { BOTTOM_NAV_HEIGHT, EmptyState, Screen, type BackgroundPreset, type MascotEmotion } from '@puzzle-studio/ui';

import { t, type MessageKey } from '@/i18n';

interface Props {
  titleKey: MessageKey;
  bodyKey: MessageKey;
  emotion: MascotEmotion;
  decor: BackgroundPreset;
  testID: string;
}

/**
 * Honest "not yet available" tab content. These tabs get their real
 * features in later phases (Creator: 3, Collection/Awards: 6) – no fake UI.
 */
export function ComingSoonScreen({ titleKey, bodyKey, emotion, decor, testID }: Props) {
  return (
    <Screen decor={decor} bottomInset={BOTTOM_NAV_HEIGHT}>
      <EmptyState testID={testID} emotion={emotion} title={t(titleKey)} message={t(bodyKey)} />
    </Screen>
  );
}
