import { SecondaryButton, Section, Text, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';
import { useSettings } from '@/store/settings';

const PRIVACY = ['local', 'noNet', 'noAds', 'picker', 'originals'] as const;

/** "Info": privacy in plain words, how backups work, and the tools. */
export function ParentsInfo() {
  const router = useRouter();
  const { resetOnboarding } = useSettings();
  return (
    <>
      <Section title={t('parents.privacy.title')} tone="mint" testID="parents-privacy">
        <View style={styles.list}>
          {PRIVACY.map((k) => (
            <Text key={k} variant="body">
              {`• ${t(`parents.privacy.${k}` as MessageKey)}`}
            </Text>
          ))}
        </View>
      </Section>

      <Section title={t('parents.backup.title')} tone="sky">
        <Text variant="body">{t('parents.backup.body')}</Text>
        <Text variant="caption" tone="secondary">
          {t('parents.backup.later')}
        </Text>
      </Section>

      <Section title={t('parents.tools')}>
        <SecondaryButton
          testID="parents-system-check"
          label={t('parents.systemCheck')}
          onPress={() => router.push('/system-check')}
        />
        <SecondaryButton
          testID="parents-benchmark"
          label={t('parents.benchmark')}
          onPress={() => router.push('/dev/stress')}
        />
        <SecondaryButton
          label={t('parents.onboarding')}
          onPress={async () => {
            await resetOnboarding();
            router.replace('/onboarding');
          }}
        />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
});
