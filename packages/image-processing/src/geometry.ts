/**
 * Crop / rotation / sizing math for the non-destructive image workflow.
 *
 * The ORIGINAL file is never modified. A "work version" is derived from
 * (original, rotation, crop, target size). All values here are plain numbers so
 * the same functions run in tests (Node), in React and inside Reanimated
 * worklets (functions marked with the 'worklet' directive).
 */

export type Rotation = 0 | 90 | 180 | 270;

export interface Size {
  width: number;
  height: number;
}

/** Crop rectangle normalized to the ROTATED original (0..1). */
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Pixel crop rectangle in the rotated original. */
export interface PixelCrop {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];

export function nextRotation(r: Rotation): Rotation {
  return ROTATIONS[(ROTATIONS.indexOf(r) + 1) % 4] ?? 0;
}

/** Size of the image after rotating by `r` (90/270 swap width and height). */
export function rotatedSize(size: Size, r: Rotation): Size {
  'worklet';
  return r === 90 || r === 270 ? { width: size.height, height: size.width } : { ...size };
}

/** Frame size of the given aspect (w/h) that fits into `max`. */
export function frameFor(aspect: number, max: Size): Size {
  const byWidth = { width: max.width, height: max.width / aspect };
  return byWidth.height <= max.height ? byWidth : { width: max.height * aspect, height: max.height };
}

/** Smallest scale at which the image fully covers the frame (no empty borders). */
export function coverScale(image: Size, frame: Size): number {
  'worklet';
  return Math.max(frame.width / image.width, frame.height / image.height);
}

/**
 * Clamps a pan offset so the scaled image always covers the frame.
 * Offset (tx, ty) = image center relative to frame center, in view points.
 */
export function clampPan(image: Size, frame: Size, scale: number, tx: number, ty: number): { tx: number; ty: number } {
  'worklet';
  const maxX = Math.max(0, (image.width * scale - frame.width) / 2);
  const maxY = Math.max(0, (image.height * scale - frame.height) / 2);
  return { tx: Math.min(maxX, Math.max(-maxX, tx)), ty: Math.min(maxY, Math.max(-maxY, ty)) };
}

/**
 * Converts the on-screen view (image centered at frame center + offset, scaled)
 * into a normalized crop of the (rotated) image.
 */
export function cropFromView(image: Size, frame: Size, scale: number, tx: number, ty: number): CropRect {
  const p = clampPan(image, frame, scale, tx, ty);
  const w = Math.min(1, frame.width / scale / image.width);
  const h = Math.min(1, frame.height / scale / image.height);
  const cx = 0.5 - p.tx / scale / image.width;
  const cy = 0.5 - p.ty / scale / image.height;
  return clampCrop({ x: cx - w / 2, y: cy - h / 2, w, h });
}

/** Keeps a normalized crop inside 0..1 without changing its size. */
export function clampCrop(c: CropRect): CropRect {
  const w = Math.min(1, Math.max(0, c.w));
  const h = Math.min(1, Math.max(0, c.h));
  return {
    x: Math.min(1 - w, Math.max(0, c.x)),
    y: Math.min(1 - h, Math.max(0, c.y)),
    w,
    h,
  };
}

/** Largest centered crop with the given aspect ratio (used for samples / "auto"). */
export function centerCrop(image: Size, aspect: number): CropRect {
  const imageAspect = image.width / image.height;
  if (imageAspect > aspect) {
    const w = aspect / imageAspect;
    return { x: (1 - w) / 2, y: 0, w, h: 1 };
  }
  const h = imageAspect / aspect;
  return { x: 0, y: (1 - h) / 2, w: 1, h };
}

/** Normalized crop → integer pixel rectangle inside the rotated image. */
export function cropToPixels(crop: CropRect, rotated: Size): PixelCrop {
  const originX = Math.round(crop.x * rotated.width);
  const originY = Math.round(crop.y * rotated.height);
  const width = Math.max(1, Math.min(rotated.width - originX, Math.round(crop.w * rotated.width)));
  const height = Math.max(1, Math.min(rotated.height - originY, Math.round(crop.h * rotated.height)));
  return { originX, originY, width, height };
}

/** Downscale (never upscale) so the longer edge is at most `maxEdge`. */
export function fitWithin(size: Size, maxEdge: number): Size {
  const long = Math.max(size.width, size.height);
  if (long <= maxEdge) return { width: Math.round(size.width), height: Math.round(size.height) };
  const f = maxEdge / long;
  return { width: Math.max(1, Math.round(size.width * f)), height: Math.max(1, Math.round(size.height * f)) };
}

/** Pipeline version – bump when the derivation changes so caches are rebuilt. */
export const PIPELINE_VERSION = 1;

/** Work version: longest edge (Skia texture for the engine). */
export const WORK_MAX_EDGE = 1536;
/** Thumbnail: longest edge (collection, home). */
export const THUMB_MAX_EDGE = 512;

/**
 * Deterministic short hash of the derivation parameters (FNV-1a, 32 bit).
 * Different crop/rotation/size → different file name → old caches can be cleaned up.
 */
export function transformHash(params: { rotation: Rotation; crop: CropRect; maxEdge: number }): string {
  const s = [
    PIPELINE_VERSION,
    params.rotation,
    params.crop.x.toFixed(4),
    params.crop.y.toFixed(4),
    params.crop.w.toFixed(4),
    params.crop.h.toFixed(4),
    params.maxEdge,
  ].join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Puzzle-friendly formats offered in the crop step. */
export const ASPECTS = {
  landscape: 4 / 3,
  square: 1,
  portrait: 3 / 4,
} as const;
export type AspectKey = keyof typeof ASPECTS;
