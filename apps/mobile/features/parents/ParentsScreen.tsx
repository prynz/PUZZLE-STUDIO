import { Icon, IconButton, Screen, SecondaryButton, SelectionCard, Surface, Text, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { PLAY_PROFILES, useSettings } from '@/store/settings';

/**
 * Parents' area – PREVIEW. The parent gate, storage management and privacy
 * settings follow in Phase 7; today it holds the play-help profile and dev tools.
 */
export function ParentsScreen() {
  const router = useRouter();
  const { settings, setProfile, resetOnboarding } = useSettings();
  return (
    <Screen scroll background="warm" contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('parents.back')} icon={<Icon name="back" />} onPress={() => router.back()} />
        <Text variant="title1" accessibilityRole="header">
          {t('parents.title')}
        </Text>
      </View>
      <Surface tone="yellow">
        <Text variant="body">{t('parents.preview')}</Text>
      </Surface>

      <Text variant="title3" accessibilityRole="header" style={styles.section}>
        {t('parents.profile')}
      </Text>
      <Text variant="body">{t('parents.profileHint')}</Text>
      <View style={styles.cards} accessibilityRole="radiogroup">
        {PLAY_PROFILES.map((p) => (
          <SelectionCard
            key={p}
            testID={`parents-profile-${p}`}
            title={t(`profile.${p}.title` as const)}
            subtitle={t(`profile.${p}.sub` as const)}
            selected={settings.profile === p}
            onPress={() => setProfile(p)}
          />
        ))}
      </View>

      <SecondaryButton
        label={t('parents.onboarding')}
        onPress={async () => {
          await resetOnboarding();
          router.replace('/onboarding');
        }}
      />

      <Text variant="title3" accessibilityRole="header" style={styles.section}>
        {t('parents.tools')}
      </Text>
      <View style={styles.tools}>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { marginTop: spacing.md },
  cards: { gap: spacing.sm },
  tools: { gap: spacing.sm },
});
