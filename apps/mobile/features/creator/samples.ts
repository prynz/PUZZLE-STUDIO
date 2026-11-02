import garden from '@/assets/samples/garden.jpg';
import meadowHouse from '@/assets/samples/meadow-house.jpg';
import nightSky from '@/assets/samples/night-sky.jpg';
import seaBoat from '@/assets/samples/sea-boat.jpg';
import type { MessageKey } from '@/i18n';

/** Bundled sample pictures (own illustrations – no third-party content). */
export const SAMPLES: readonly { id: string; module: number; labelKey: MessageKey }[] = [
  { id: 'meadow-house', module: meadowHouse, labelKey: 'samples.meadowHouse' },
  { id: 'sea-boat', module: seaBoat, labelKey: 'samples.seaBoat' },
  { id: 'night-sky', module: nightSky, labelKey: 'samples.nightSky' },
  { id: 'garden', module: garden, labelKey: 'samples.garden' },
];
