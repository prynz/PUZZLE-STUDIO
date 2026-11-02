import {
  THUMB_MAX_EDGE,
  WORK_MAX_EDGE,
  cropToPixels,
  fitWithin,
  rotatedSize,
  transformHash,
  type CropRect,
  type Rotation,
  type Size,
} from '@puzzle-studio/image-processing';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { DerivedImages } from '@/storage/images/types';

/**
 * Derives the work version (rotation → crop → resize, JPEG, re-encoded so EXIF/GPS
 * metadata is dropped) and a thumbnail. The original at `sourceUri` is only read.
 */
export async function deriveImages(
  sourceUri: string,
  original: Size,
  rotation: Rotation,
  crop: CropRect,
): Promise<DerivedImages> {
  const rotated = rotatedSize(original, rotation);
  const px = cropToPixels(crop, rotated);
  const target = fitWithin({ width: px.width, height: px.height }, WORK_MAX_EDGE);

  let ctx = ImageManipulator.manipulate(sourceUri);
  if (rotation !== 0) ctx = ctx.rotate(rotation);
  const workRef = await ctx.crop(px).resize({ width: target.width, height: target.height }).renderAsync();
  const work = await workRef.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });

  const thumbSize = fitWithin({ width: work.width, height: work.height }, THUMB_MAX_EDGE);
  const thumbRef = await ImageManipulator.manipulate(work.uri).resize(thumbSize).renderAsync();
  const thumb = await thumbRef.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });

  return {
    work: { uri: work.uri, width: work.width, height: work.height },
    thumb: { uri: thumb.uri, width: thumb.width, height: thumb.height },
    hash: transformHash({ rotation, crop, maxEdge: WORK_MAX_EDGE }),
  };
}
