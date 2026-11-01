import { PrimaryButton, Screen, SecondaryButton, Text, color, radius, spacing } from '@puzzle-studio/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import pino from '@/assets/brand/splash-icon.png';
import { t } from '@/i18n/index';

/**
 * Phase 1 entry screen. Intentionally honest: it shows the foundation status
 * and gives access to the real system check and the 256-piece benchmark.
 * The designed Home / Onboarding screens arrive in Phase 2.
 */
export function StartScreen() {
  const router = useRouter();
  return (
    <Screen
      footer={
        <View style={styles.actions}>
          <PrimaryButton
            testID="start-system-check"
            label={t('start.systemCheck')}
            onPress={() => router.push('/system-check')}
          />
          <SecondaryButton
            testID="start-benchmark"
            label={t('start.benchmark')}
            onPress={() => router.push('/dev/stress')}
          />
        </View>
      }
    >
      <View style={styles.badge}>
        <Text variant="caption" tone="brand">
          {t('start.phaseBadge')}
        </Text>
      </View>
      <Text variant="hero" align="center" style={styles.title} accessibilityRole="header">
        {t('start.title')}
      </Text>
      <Text variant="bodyLarge" align="center" style={styles.subtitle}>
        {t('start.subtitle')}
      </Text>
      <View style={styles.mascotWrap}>
        <Image source={pino} style={styles.mascot} contentFit="contain" accessibilityLabel={t('start.mascotLabel')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    backgroundColor: color.surface.lavender,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 2,
    marginTop: spacing.md,
  },
  title: { marginTop: spacing.xl },
  subtitle: { marginTop: spacing.sm, paddingHorizontal: spacing.md },
  mascotWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 260, height: 260 },
  actions: { gap: spacing.sm },
});
