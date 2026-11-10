import { ACHIEVEMENTS } from '@puzzle-studio/game-progression';
import { Mascot, ProgressBar, StoryCard, StoryCarousel, StoryPicture, StoryStars } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';

import type { CollectionItem } from '@/features/collection/collectionView';
import { SAMPLES } from '@/features/creator/samples';
import { journeyPicture } from '@/features/journey/pictures';
import { starsText, t } from '@/i18n';
import { useJourney } from '@/store/journey';
import { useProgress } from '@/store/progress';

const SAMPLE_PICTURE = SAMPLES.find((s) => s.id === 'sea-boat')?.module;

export interface HomeStoryProps {
  /** Unfinished puzzle of an own picture (journey puzzles continue via "Spielen"). */
  open: CollectionItem | null;
  onPlay: (stationId: string) => void;
}

/**
 * The swipeable story cards at the top of the start screen: "Spielen" (always the next station
 * of Pino's journey), continue an own puzzle, own pictures (atelier), Pino's pictures and the
 * treasure chest (stars and rewards).
 */
export function HomeStory({ open, onPlay }: HomeStoryProps) {
  const router = useRouter();
  const { stats, unlocked } = useProgress();
  const { position } = useJourney();
  const reached = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const next = position.next;
  const nextPicture = next ? journeyPicture(next.picture) : undefined;
  return (
    // new cards (next station, open puzzle) – start again at the first one
    <StoryCarousel key={`${next?.id ?? 'end'}-${open?.puzzle.id ?? 'none'}`} testID="home-story">
      {next ? (
        <StoryCard
          testID="home-play"
          tone="brand"
          eyebrow={t('home.story.playEyebrow', {
            n: position.stationIndex + 1,
            total: position.world.stations.length,
          })}
          title={t('home.story.playTitle')}
          subtitle={t('home.story.playSub', {
            name: nextPicture ? t(nextPicture.labelKey) : '',
            pieces: next.pieces,
          })}
          art={nextPicture ? <StoryPicture source={nextPicture.module} /> : undefined}
          onPress={() => onPlay(next.id)}
        />
      ) : null}
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
        tone="sky"
        eyebrow={t('home.story.createEyebrow')}
        title={t('home.create.title')}
        subtitle={t('home.create.sub')}
        art={<Mascot emotion="excited" size={136} accessibilityLabel={null} />}
        onPress={() => router.push('/create')}
      />
      <StoryCard
        testID="home-samples"
        tone="sun"
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
