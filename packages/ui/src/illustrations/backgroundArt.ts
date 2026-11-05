import skyMeadow from '../../assets/backgrounds/sky-meadow.jpg';
import type { BackgroundPreset } from './backgrounds.ts';

export interface BackgroundArt {
  source: number;
  /** Pixel size of the file – needed to cover any screen without distortion. */
  width: number;
  height: number;
  /** Point that must stay visible when the picture is cropped (0…1; y = 1 keeps the bottom). */
  focus: { x: number; y: number };
}

/**
 * Painted backgrounds delivered by the PO (originals untouched in docs/design/background-art/).
 * They always cover the whole screen; what gets cropped is decided by `focus`.
 */
export const BACKGROUND_ART: Partial<Record<BackgroundPreset, BackgroundArt>> = {
  // landscape painting on portrait screens: meadow stays at the bottom; slightly left of centre
  // so the big left cloud and the sparkles are in view (the middle of the painting is empty sky)
  skyMeadow: { source: skyMeadow, width: 1785, height: 881, focus: { x: 0.12, y: 1 } },
};

/**
 * Size and offset that cover a `boxW` × `boxH` area with the picture (like CSS "cover"),
 * cropping around `focus`. Pure – tested.
 */
export function coverLayout(art: Pick<BackgroundArt, 'width' | 'height' | 'focus'>, boxW: number, boxH: number) {
  const scale = Math.max(boxW / art.width, boxH / art.height);
  const width = art.width * scale;
  const height = art.height * scale;
  return {
    width,
    height,
    left: (boxW - width) * art.focus.x,
    top: (boxH - height) * art.focus.y,
  };
}
