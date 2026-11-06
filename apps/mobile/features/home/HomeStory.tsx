import { ACHIEVEMENTS } from '@puzzle-studio/game-progression';
import { Mascot, ProgressBar, StoryCard, StoryCarousel, StoryPicture, StoryStars } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';

import type { CollectionItem } from '@/features/collection/collectionView';
import { SAMPLES } from '@/features/creator/samples';
import { starsText, t } from '@/i18n';
import { useProgress } from '@/store/progress';

const SAMPLE_PICTURE = SAMPLES.find((s) => s.id === 'sea-boat')?.module;

/**
 * The swipeable story cards at the top of the start screen: continue the open puzzle (if any),
 * start a new one from a photo, pick one of Pino's pictures, or open the treasure chest
 * (stars and rewards).
 */
export function HomeStory({ open }: { open: CollectionItem | null }) {
  const router = useRouter();
  const { stats, unlocked } = useProgress();
  const reached = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  return (
    // a new or finished open puzzle changes the cards – start again at the first one
    <StoryCarousel key={open?.puzzle.id ?? 'none'} testID="home-story">
      {open ? (
        <StoryCard
          testID="home-continue"
          tone="sun"
          eyebrow={t('home.story.continueEyebrow')}
          title={t('home.story.continueTitle')}
          subtitle={t('home.story.continueSub', { placed: open.puzzle.placedCount, n: open.pieces })}
          footer={<ProgressBar value={open.progress} />}
          art={<StoryPicture source={{ uri: open.image.thumbUri }} />}
          onPress={() => router.push({ pathname: '/puzzle/[id]', params: { id: open.puzzle.id } })}
        />
      ) : null}
      <StoryCard
        testID="home-create"
        tone="brand"
        eyebrow={t('home.story.createEyebrow')}
        title={t('home.create.title')}
        subtitle={t('home.create.sub')}
        art={<Mascot emotion="excited" size={136} accessibilityLabel={null} />}
        onPress={() => router.push('/create')}
      />
      <StoryCard
        testID="home-samples"
        tone="sky"
        eyebrow={t('home.story.samplesEyebrow')}
        title={t('home.story.samplesTitle')}
        subtitle={t('home.story.samplesSub')}
        art={SAMPLE_PICTURE === undefined ? undefined : <StoryPicture source={SAMPLE_PICTURE} tilt={-6} />}
        onPress={() => router.push('/creator/samples')}
      />
      <StoryCard
        testID="home-awards"
        tone="ember"
        eyebrow={t('home.story.treasureEyebrow')}
        title={t('home.story.treasureTitle')}
        subtitle={
          stats.stars > 0
            ? t('home.story.treasureSub', { stars: starsText(stats.stars), n: reached, total: ACHIEVEMENTS.length })
            : t('home.story.treasureEmpty')
        }
        art={<StoryStars stars={stats.stars} />}
        onPress={() => router.push('/awards')}
      />
    </StoryCarousel>
  );
}
