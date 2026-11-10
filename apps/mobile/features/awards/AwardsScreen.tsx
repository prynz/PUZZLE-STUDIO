import { ACHIEVEMENTS, unlockedRewards, validChoice } from '@puzzle-studio/game-progression';
import {
  AchievementCard,
  Appear,
  BOTTOM_NAV_HEIGHT,
  Mascot,
  RewardBadge,
  Screen,
  Section,
  SegmentedControl,
  Sparkles,
  SpeechBubble,
  Text,
  layout,
  spacing,
  staggerDelay,
} from '@puzzle-studio/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { starsText, t, type MessageKey } from '@/i18n';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';

import { JourneyAlbum } from './JourneyAlbum';
import { RewardPicker } from './RewardPicker';

type Area = 'album' | 'milestones' | 'rewards' | 'stickers';
const AREAS: Area[] = ['album', 'milestones', 'rewards', 'stickers'];

/**
 * Tab "Erfolge": stars, then four areas to switch between (instead of one very long page):
 * the album with the pictures of Pino's journey (first, concept 2), milestones (2-column
 * tiles), rewards to apply and the reward stickers.
 */
export function AwardsScreen() {
  const { stats, unlocked } = useProgress();
  const { settings, setReward } = useSettings();
  const [area, setArea] = useState<Area>('album');
  const stickers = unlockedRewards(unlocked, 'sticker');
  const reached = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const segments = AREAS.map((key) => ({ key, label: t(`awards.${key}` as MessageKey) }));
  const mascot = <Mascot emotion={stats.stars > 0 ? 'success' : 'encourage'} size={84} accessibilityLabel={null} />;

  return (
    <Screen scroll decor="meadow" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <Appear variant="rise" style={styles.hero}>
        {stats.stars > 0 ? <Sparkles>{mascot}</Sparkles> : mascot}
        <SpeechBubble>
          <Text variant="title3" testID="awards-stars">
            {stats.stars > 0 ? t('awards.stars', { stars: starsText(stats.stars) }) : t('awards.starsNone')}
          </Text>
          <Text variant="label" tone="secondary">
            {t('awards.progress', { n: reached, total: ACHIEVEMENTS.length })}
          </Text>
        </SpeechBubble>
      </Appear>

      <SegmentedControl segments={segments} value={area} onChange={setArea} testIDPrefix="awards" />

      {area === 'album' ? <JourneyAlbum /> : null}

      {area === 'milestones' ? (
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((a, index) => {
            const on = unlocked.has(a.id);
            return (
              <Appear key={a.id} variant="pop" delay={staggerDelay(index)} style={styles.cell}>
                <AchievementCard
                  layout="tile"
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
              </Appear>
            );
          })}
        </View>
      ) : null}

      {area === 'rewards' ? (
        <>
          <Appear variant="rise">
            <Section tone="mint">
              <RewardPicker
                kind="background"
                title={t('awards.backgrounds')}
                unlocked={unlocked}
                value={validChoice(settings.boardBackground, unlocked, 'background')}
                onChange={(id) => setReward('boardBackground', id)}
              />
            </Section>
          </Appear>
          <Appear variant="rise" delay={staggerDelay(1)}>
            <Section tone="yellow">
              <RewardPicker
                kind="frame"
                title={t('awards.frames')}
                unlocked={unlocked}
                value={validChoice(settings.cardFrame, unlocked, 'frame')}
                onChange={(id) => setReward('cardFrame', id)}
              />
            </Section>
          </Appear>
        </>
      ) : null}

      {area === 'stickers' ? (
        <Section title={t('awards.stickers')} tone="pink">
          {stickers.length === 0 ? (
            <Text variant="body">{t('awards.stickersEmpty')}</Text>
          ) : (
            <View style={styles.album}>
              {stickers.map((s, index) => (
                <Appear key={s.id} variant="pop" delay={staggerDelay(index, 90)}>
                  <View accessible accessibilityLabel={t(`reward.${s.id}` as MessageKey)}>
                    <RewardBadge id={s.id} size={88} />
                  </View>
                </Appear>
              ))}
            </View>
          )}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
  album: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
