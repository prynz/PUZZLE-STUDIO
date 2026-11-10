import { ENGINE_VERSION, chooseGrid } from '@puzzle-studio/puzzle-engine';
import type { Station } from '@puzzle-studio/game-progression';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { deriveImages } from '@/services/imagePipeline';
import { loadSample } from '@/services/imageSources';
import { useImages } from '@/store/images';
import { useJourney } from '@/store/journey';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

import { journeyPicture } from './pictures';

const WHOLE_PICTURE = { x: 0, y: 0, w: 1, h: 1 };

/**
 * Starts a journey station: imports its picture once (the whole picture, no cropping), resumes
 * an unfinished puzzle of this station or creates a new one, and opens it.
 */
export function useStartStation() {
  const router = useRouter();
  const journey = useJourney();
  const { images, add } = useImages();
  const { puzzles, create } = usePuzzles();
  const { settings } = useSettings();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = useCallback(
    async (station: Station) => {
      const picture = journeyPicture(station.picture);
      if (!picture || busy) return;
      setBusy(true);
      setFailed(false);
      try {
        // the station's unfinished puzzle is simply continued
        const active = journey.active;
        const open =
          active?.stationId === station.id
            ? puzzles.find((p) => p.id === active.puzzleId && p.status !== 'completed')
            : undefined;
        if (open) {
          router.push({ pathname: '/puzzle/[id]', params: { id: open.id } });
          return;
        }
        let image = images.find((i) => i.id === journey.images[station.picture]);
        if (!image) {
          const sample = await loadSample(picture.module);
          const original = { width: sample.width, height: sample.height };
          const derived = await deriveImages(sample.uri, original, 0, WHOLE_PICTURE);
          image = await add({
            sourceUri: sample.uri,
            sourceKind: 'sample',
            extension: sample.extension,
            width: sample.width,
            height: sample.height,
            rotation: 0,
            crop: WHOLE_PICTURE,
            derived,
          });
          await journey.rememberImage(station.picture, image.id);
        }
        const grid = chooseGrid(station.pieces, image.work.width / image.work.height);
        const p = await create({
          imageId: image.id,
          profile: settings.profile,
          definition: {
            engineVersion: ENGINE_VERSION,
            seed: Math.floor(Math.random() * 0x7fffffff),
            rows: grid.rows,
            cols: grid.cols,
            shape: 'classic',
            width: image.work.width,
            height: image.work.height,
          },
        });
        await journey.setActive({ stationId: station.id, puzzleId: p.id });
        router.push({ pathname: '/puzzle/[id]', params: { id: p.id } });
      } catch {
        // shown as a friendly hint on the start screen; nothing is logged about the picture
        setFailed(true);
      } finally {
        setBusy(false);
      }
    },
    [busy, journey, images, add, puzzles, create, settings.profile, router],
  );

  return { start, busy, failed };
}
