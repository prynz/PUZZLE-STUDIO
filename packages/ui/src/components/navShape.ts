import { radius } from '../tokens.ts';

/**
 * Geometry of the bottom bar with the "notch" under the active tab bubble (pure, tested).
 * Bar outline, rounded corners and notch are ONE path, so the shadow can follow the notch.
 * Functions are worklets: the path is rebuilt on the UI thread while the bubble glides.
 */
export const NAV_BAR_HEIGHT = 64;
/** Diameter of the round bubble that carries the active icon. */
export const NAV_BUBBLE = 56;
/** How far the bubble pokes out above the bar. */
export const NAV_BUBBLE_RISE = 32;
/** Corner radius of the bar (like the reference: soft, not a pill). */
export const NAV_CORNER = radius.md;
const NOTCH_HALF = 34; // half width of the dip at its widest
const NOTCH_SHOULDER = 8; // soft rounding where the dip meets the bar edge
const NOTCH_DEPTH = 34;
/** Bar that must stay visible between a corner and the notch of an edge tab. */
const EDGE_GAP = 8;

/** Half the width the notch needs. */
export const NOTCH_REACH = NOTCH_HALF + NOTCH_SHOULDER;

/**
 * Side inset of the tab row: the outer tabs move inwards just enough that their notch never
 * runs into a rounded corner (the bar stays visible beside it, as in the reference).
 */
export function navInset(width: number, count: number): number {
  'worklet';
  const minCenter = NAV_CORNER + EDGE_GAP + NOTCH_REACH;
  return Math.max(0, (minCenter - width / (2 * count)) / (1 - 1 / count));
}

/** Centre x of tab `index` when `count` tabs share the inset row. */
export function tabCenter(width: number, count: number, index: number): number {
  'worklet';
  const inset = navInset(width, count);
  return inset + ((width - 2 * inset) / count) * (index + 0.5);
}

/** SVG path: bar `width` × `height` with rounded corners and a U-shaped notch centred at `cx`. */
export function notchedBarPath(width: number, height: number, cx: number): string {
  'worklet';
  const r = NAV_CORNER;
  const h = NOTCH_HALF;
  const d = NOTCH_DEPTH;
  return (
    `M${r} 0 H${cx - NOTCH_REACH} ` +
    `C${cx - h} 0 ${cx - h} ${d} ${cx} ${d} ` +
    `C${cx + h} ${d} ${cx + h} 0 ${cx + NOTCH_REACH} 0 ` +
    `H${width - r} A${r} ${r} 0 0 1 ${width} ${r} V${height - r} A${r} ${r} 0 0 1 ${width - r} ${height} ` +
    `H${r} A${r} ${r} 0 0 1 0 ${height - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`
  );
}
