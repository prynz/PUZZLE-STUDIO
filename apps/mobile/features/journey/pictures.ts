import { SAMPLES } from '@/features/creator/samples';
import type { MessageKey } from '@/i18n';

/** A journey picture: bundled image + its name. Journey stations name pictures by sample id. */
export interface JourneyPicture {
  module: number;
  labelKey: MessageKey;
}

export function journeyPicture(id: string): JourneyPicture | undefined {
  const s = SAMPLES.find((x) => x.id === id);
  return s ? { module: s.module, labelKey: s.labelKey } : undefined;
}
