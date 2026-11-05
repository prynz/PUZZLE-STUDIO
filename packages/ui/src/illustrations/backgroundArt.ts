import skyMeadow from '../../assets/backgrounds/sky-meadow.jpg';
import type { BackgroundPreset } from './backgrounds.ts';

/**
 * Painted backgrounds delivered by the PO (originals untouched in docs/design/background-art/).
 * Shown with "cover": centred, cropped at the sides on narrow screens.
 */
export const BACKGROUND_ART: Partial<Record<BackgroundPreset, number>> = { skyMeadow };
