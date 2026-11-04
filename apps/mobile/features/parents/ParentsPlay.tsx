import { Chip, Section, SelectionCard, Text, ToggleRow, spacing } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { PLAY_PROFILES, useSettings, type ParentOptions } from '@/store/settings';

const MISPLACE: ParentOptions['misplace'][] = ['profile', 'nudge', 'return'];

/** "Spiel": play-help profile and the options that shape a new puzzle. */
export function ParentsPlay() {
  const { settings, setProfile, setParentOption } = useSettings();
  const p = settings.parent;
  const toddler = settings.profile === 'toddler';
  const set =
    <K extends keyof ParentOptions>(key: K) =>
    (value: ParentOptions[K]) => {
      setParentOption(key, value).catch(() => undefined); // UI already shows the choice; next start re-reads
    };
  return (
    <>
      <Section title={t('parents.profile')} tone="leaf">
        <Text variant="body">{t('parents.profileHint')}</Text>
        <View style={styles.cards} accessibilityRole="radiogroup">
          {PLAY_PROFILES.map((profile) => (
            <SelectionCard
              key={profile}
              testID={`parents-profile-${profile}`}
              title={t(`profile.${profile}.title` as const)}
              subtitle={t(`profile.${profile}.sub` as const)}
              selected={settings.profile === profile}
              onPress={() => setProfile(profile)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('parents.misplace')}>
        <Text variant="body">{toddler ? t('parents.misplaceToddler') : t('parents.misplaceHint')}</Text>
        {toddler ? null : (
          <View style={styles.chips} accessibilityRole="radiogroup">
            {MISPLACE.map((m) => (
              <Chip
                key={m}
                testID={`misplace-${m}`}
                label={t(`parents.misplace.${m}` as const)}
                selected={p.misplace === m}
                onPress={() => set('misplace')(m)}
              />
            ))}
          </View>
        )}
      </Section>

      <Section title={t('parents.helpers')} tone="mint">
        <ToggleRow
          testID="toggle-reference"
          label={t('parents.reference')}
          description={t('parents.referenceHint')}
          value={p.reference}
          onChange={set('reference')}
        />
        <ToggleRow
          testID="toggle-hint-offers"
          label={t('parents.hintOffers')}
          description={toddler || settings.profile === 'kid' ? t('parents.hintOffersHint') : t('parents.hintOffersPro')}
          value={p.hintOffers}
          onChange={set('hintOffers')}
          disabled={settings.profile === 'pro'}
        />
        <ToggleRow
          testID="toggle-reduce-motion"
          label={t('parents.reduceMotion')}
          description={t('parents.reduceMotionHint')}
          value={p.reduceMotion}
          onChange={set('reduceMotion')}
        />
        <Text variant="caption" tone="secondary">
          {t('parents.newPuzzleNote')}
        </Text>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  cards: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
