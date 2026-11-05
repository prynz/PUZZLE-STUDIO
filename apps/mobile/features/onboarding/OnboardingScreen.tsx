import {
  Appear,
  Mascot,
  PrimaryButton,
  ProgressDots,
  Screen,
  SecondaryButton,
  SelectionCard,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { DEFAULT_PROFILE, useSettings, type PlayProfile } from '@/store/settings';

const PROFILE_CARDS: readonly { id: PlayProfile; size: number; tone: 'mint' | 'yellow' | 'leaf' }[] = [
  { id: 'toddler', size: 48, tone: 'mint' },
  { id: 'kid', size: 60, tone: 'yellow' },
  { id: 'pro', size: 72, tone: 'leaf' },
];

/** Three-step onboarding: welcome → promise → "Wer puzzelt?" (play-help profile). Skippable. */
export function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, settings } = useSettings();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PlayProfile>(settings.profile ?? DEFAULT_PROFILE);

  const finish = async (p: PlayProfile) => {
    await completeOnboarding(p);
    router.replace('/home');
  };

  const dots = <ProgressDots count={3} active={step} accessibilityLabel={t('onb.step', { n: step + 1 })} />;

  if (step === 0) {
    return (
      <Screen
        decor="skyMeadow"
        footer={
          <View style={styles.footer}>
            {dots}
            <PrimaryButton testID="onb-next" label={t('onb.welcome.cta')} onPress={() => setStep(1)} />
          </View>
        }
      >
        <Appear style={styles.fill}>
          <SecondaryButton
            testID="onb-skip"
            size="compact"
            label={t('onb.skip')}
            onPress={() => finish(DEFAULT_PROFILE)}
            style={styles.skip}
          />
          <Text variant="hero" align="center" accessibilityRole="header" style={styles.title}>
            {t('onb.welcome.title')}
          </Text>
          <Text variant="bodyLarge" align="center" style={styles.body}>
            {t('onb.welcome.body')}
          </Text>
          <View style={styles.mascot}>
            <Mascot emotion="greeting" size={250} animated />
          </View>
        </Appear>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen
        background="dream"
        decor="dream"
        footer={
          <View style={styles.footer}>
            {dots}
            <PrimaryButton
              testID="onb-next"
              variant="primary"
              label={t('onb.promise.cta')}
              onPress={() => setStep(2)}
            />
          </View>
        }
      >
        <Appear style={styles.fill}>
          <SecondaryButton
            size="compact"
            label={t('onb.skip')}
            onPress={() => finish(DEFAULT_PROFILE)}
            style={styles.skip}
          />
          <View style={styles.mascotTop}>
            <Mascot emotion="excited" size={230} animated />
          </View>
          <Text variant="title1" align="center" accessibilityRole="header">
            {t('onb.promise.title')}
          </Text>
          <Text variant="bodyLarge" align="center" style={styles.body}>
            {t('onb.promise.body')}
          </Text>
        </Appear>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      decor="sky"
      footer={
        <View style={styles.footer}>
          {dots}
          <PrimaryButton
            testID="onb-finish"
            variant="primary"
            label={t('onb.profile.cta')}
            onPress={() => finish(profile)}
          />
        </View>
      }
    >
      <Appear style={styles.profileWrap}>
        <Text variant="title1" align="center" accessibilityRole="header" style={styles.title}>
          {t('onb.profile.title')}
        </Text>
        <Text variant="body" align="center" style={styles.body}>
          {t('onb.profile.body')}
        </Text>
        <View style={styles.cards} accessibilityRole="radiogroup">
          {PROFILE_CARDS.map((c) => (
            <SelectionCard
              key={c.id}
              testID={`profile-${c.id}`}
              tone={c.tone}
              title={t(`profile.${c.id}.title` as const)}
              subtitle={t(`profile.${c.id}.sub` as const)}
              selected={profile === c.id}
              onPress={() => setProfile(c.id)}
              illustration={
                <Mascot
                  emotion={c.id === 'toddler' ? 'happy' : c.id === 'kid' ? 'greeting' : 'excited'}
                  size={c.size}
                  accessibilityLabel={null}
                />
              }
            />
          ))}
        </View>
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center' },
  skip: { alignSelf: 'flex-end' },
  title: { marginTop: spacing.lg },
  body: { marginTop: spacing.sm, paddingHorizontal: spacing.md, maxWidth: 340 },
  mascot: { flex: 1, justifyContent: 'center' },
  mascotTop: { flex: 1, justifyContent: 'center', marginBottom: spacing.md },
  footer: { gap: spacing.lg },
  profileWrap: { alignItems: 'stretch' },
  cards: { gap: spacing.md, marginTop: spacing.xl },
});
