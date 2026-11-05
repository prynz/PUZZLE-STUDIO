import excited from '../../assets/mascot/excited.png';
import greeting from '../../assets/mascot/greeting.png';
import thinking from '../../assets/mascot/thinking.png';
import type { MascotEmotion } from './pino.ts';

/** Bundled image sources for the delivered artwork – keys must match MASCOT_ART_FILES (tested). */
export const MASCOT_ART_SOURCES: Partial<Record<MascotEmotion, number>> = { greeting, excited, thinking };
