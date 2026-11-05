import excited from '../../assets/mascot/excited.png';
import greeting from '../../assets/mascot/greeting.png';
import guard from '../../assets/mascot/guard.png';
import happy from '../../assets/mascot/happy.png';
import sleeping from '../../assets/mascot/sleeping.png';
import thinking from '../../assets/mascot/thinking.png';
import type { MascotEmotion } from './pino.ts';

/** Bundled image sources for the delivered artwork – keys must match MASCOT_ART_FILES (tested). */
export const MASCOT_ART_SOURCES: Partial<Record<MascotEmotion, number>> = {
  greeting,
  excited,
  thinking,
  happy,
  sleeping,
  guard,
};
