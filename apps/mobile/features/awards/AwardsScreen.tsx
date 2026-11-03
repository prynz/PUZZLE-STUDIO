import { ACHIEVEMENTS, unlockedRewards, validChoice } from '@puzzle-studio/game-progression';
import {
  AchievementCard,
  BOTTOM_NAV_HEIGHT,
  Mascot,
  RewardBadge,
  Screen,
  SpeechBubble,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { starsText, t, type MessageKey } from '@/i18n';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';

import { RewardPicker } from './RewardPicker';

/** Tab "Erfolge": stars, friendly milestones, rewards to apply and the sticker album. */
export function AwardsScreen() {
  const { stats, unlocked } = useProgress();
  const { settings, setReward } = useSettings();
  const stickers = unlockedRewards(unlocked, 'sticker');
  return (
    <Screen scroll decor="meadow" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <Text variant="title1" accessibilityRole="header">
        {t('awards.title')}
      </Text>
      <View style={styles.hero}>
        <Mascot emotion={stats.stars > 0 ? 'success' : 'encourage'} size={96} accessibilityLabel={null} />
        <SpeechBubble>
          <Text variant="title3" testID="awards-stars">
            {stats.stars > 0 ? t('awards.stars', { stars: starsText(stats.stars) }) : t('awards.starsNone')}
          </Text>
        </SpeechBubble>
      </View>

      <Text variant="title3" accessibilityRole="header">
        {t('awards.milestones')}
      </Text>
      {ACHIEVEMENTS.map((a) => {
        const on = unlocked.has(a.id);
        return (
          <AchievementCard
            key={a.id}
            testID={`ach-${a.id}`}
            title={t(`ach.${a.id}` as MessageKey)}
            description={
              on
                ? t('awards.reward', { reward: t(`reward.${a.reward.id}` as MessageKey) })
                : t(`ach.${a.id}.how` as MessageKey)
            }
            rewardId={a.reward.id}
            unlocked={on}
          />
        );
      })}

      <RewardPicker
        kind="background"
        title={t('awards.backgrounds')}
        unlocked={unlocked}
        value={validChoice(settings.boardBackground, unlocked, 'background')}
        onChange={(id) => setReward('boardBackground', id)}
      />
      <RewardPicker
        kind="frame"
        title={t('awards.frames')}
        unlocked={unlocked}
        value={validChoice(settings.cardFrame, unlocked, 'frame')}
        onChange={(id) => setReward('cardFrame', id)}
      />

      <Text variant="title3" accessibilityRole="header">
        {t('awards.stickers')}
      </Text>
      {stickers.length === 0 ? (
        <Text variant="body">{t('awards.stickersEmpty')}</Text>
      ) : (
        <View style={styles.album}>
          {stickers.map((s) => (
            <View key={s.id} style={styles.sticker} accessible accessibilityLabel={t(`reward.${s.id}` as MessageKey)}>
              <RewardBadge id={s.id} size={88} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  album: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sticker: { alignItems: 'center' },
});
