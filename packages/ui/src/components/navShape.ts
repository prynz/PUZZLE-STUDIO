/**
 * Geometry of the bottom bar with the "notch" under the active tab bubble (pure, tested).
 * The bar is drawn once, three times as wide as the screen, with the notch in its middle –
 * moving it sideways moves the notch, so the shape never has to be re-computed while animating.
 */
export const NAV_BAR_HEIGHT = 64;
/** Diameter of the round bubble that carries the active icon. */
export const NAV_BUBBLE = 56;
/** How far the bubble pokes out above the bar. */
export const NAV_BUBBLE_RISE = 32;
const NOTCH_HALF = 36; // half width of the dip at its widest
const NOTCH_SHOULDER = 8; // soft rounding where the dip meets the bar edge
const NOTCH_DEPTH = 34;

/** Half the width the notch needs – tabs must be at least twice as wide for the notch to fit. */
export const NOTCH_REACH = NOTCH_HALF + NOTCH_SHOULDER;

/** SVG path of a bar `width` × `height` with a smooth U-shaped notch centred at `cx`. */
export function notchedBarPath(width: number, height: number, cx: number): string {
  const l = cx - NOTCH_REACH;
  const r = cx + NOTCH_REACH;
  const d = NOTCH_DEPTH;
  const h = NOTCH_HALF;
  return [
    `M0 0 H${l}`,
    `C${cx - h} 0 ${cx - h} ${d} ${cx} ${d}`,
    `C${cx + h} ${d} ${cx + h} 0 ${r} 0`,
    `H${width} V${height} H0 Z`,
  ].join(' ');
}

/** Centre x of tab `index` when `count` tabs share `width` equally. */
export function tabCenter(width: number, count: number, index: number): number {
  return (width / count) * (index + 0.5);
}
