import type { Point, Rect } from '@puzzle-studio/puzzle-engine';

/** World (image space) → screen: screen = world · scale + (x, y). */
export interface View {
  scale: number;
  x: number;
  y: number;
}

/** View that shows `world` (padded) centred and fully inside `area`. */
export function fitView(area: Rect, world: Rect, pad = 0): View {
  const w = world.w + pad * 2;
  const h = world.h + pad * 2;
  const scale = Math.min(area.w / w, area.h / h);
  return {
    scale,
    x: area.x + (area.w - world.w * scale) / 2 - world.x * scale,
    y: area.y + (area.h - world.h * scale) / 2 - world.y * scale,
  };
}

export const toWorld = (v: View, sx: number, sy: number): Point => ({
  x: (sx - v.x) / v.scale,
  y: (sy - v.y) / v.scale,
});
export const toScreen = (v: View, wx: number, wy: number): Point => ({ x: wx * v.scale + v.x, y: wy * v.scale + v.y });

/** Zoom levels for big puzzles (kid/pro, from 64 pieces). */
export const ZOOM_LEVELS = [1, 1.75, 2.75] as const;

/** Zooms the base view by `zoom` around the area centre, then keeps the board reachable. */
export function zoomed(base: View, area: Rect, board: Rect, zoom: number, focus: Point): View {
  const scale = base.scale * zoom;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  return clampView({ scale, x: cx - focus.x * scale, y: cy - focus.y * scale }, area, board);
}

/**
 * Keeps the board reachable: if it fits, it stays fully inside the area; if it is zoomed
 * bigger than the area, its centre stays inside the area.
 */
export function clampView(v: View, area: Rect, board: Rect): View {
  const axis = (pos: number, start: number, len: number, bStart: number, bLen: number) => {
    const size = bLen * v.scale;
    const lo = size <= len ? start - bStart * v.scale : start - (bStart + bLen / 2) * v.scale;
    const hi = size <= len ? start + len - (bStart + bLen) * v.scale : start + len - (bStart + bLen / 2) * v.scale;
    return Math.min(Math.max(pos, lo), hi);
  };
  return {
    scale: v.scale,
    x: axis(v.x, area.x, area.w, board.x, board.w),
    y: axis(v.y, area.y, area.h, board.y, board.h),
  };
}
