import { describe, expect, it } from 'vitest';

import {
  centerCrop,
  clampPan,
  coverScale,
  cropFromView,
  cropToPixels,
  fitWithin,
  frameFor,
  nextRotation,
  rotatedSize,
  transformHash,
} from '../src/geometry.ts';

const img = { width: 4000, height: 3000 };

describe('rotation', () => {
  it('swaps sides for 90/270 only', () => {
    expect(rotatedSize(img, 0)).toEqual(img);
    expect(rotatedSize(img, 90)).toEqual({ width: 3000, height: 4000 });
    expect(rotatedSize(img, 180)).toEqual(img);
    expect(rotatedSize(img, 270)).toEqual({ width: 3000, height: 4000 });
  });
  it('cycles 0 → 90 → 180 → 270 → 0', () => {
    expect([nextRotation(0), nextRotation(90), nextRotation(180), nextRotation(270)]).toEqual([90, 180, 270, 0]);
  });
});

describe('frame & cover', () => {
  it('fits the frame into the available area', () => {
    expect(frameFor(4 / 3, { width: 300, height: 400 })).toEqual({ width: 300, height: 225 });
    expect(frameFor(3 / 4, { width: 300, height: 200 })).toEqual({ width: 150, height: 200 });
  });
  it('cover scale fills the frame completely', () => {
    const frame = { width: 300, height: 300 };
    const s = coverScale(img, frame);
    expect(img.width * s).toBeGreaterThanOrEqual(300);
    expect(img.height * s).toBeCloseTo(300);
  });
});

describe('pan clamping', () => {
  it('never shows empty borders', () => {
    const frame = { width: 300, height: 300 };
    const s = coverScale(img, frame); // image 400 × 300 on screen
    expect(clampPan(img, frame, s, 999, 999)).toEqual({ tx: 50, ty: 0 });
    expect(clampPan(img, frame, s, -999, 0)).toEqual({ tx: -50, ty: 0 });
  });
});

describe('cropFromView', () => {
  const frame = { width: 300, height: 300 };
  it('centered cover view = centered square crop', () => {
    const s = coverScale(img, frame);
    const c = cropFromView(img, frame, s, 0, 0);
    expect(c.w).toBeCloseTo(0.75);
    expect(c.h).toBeCloseTo(1);
    expect(c.x).toBeCloseTo(0.125);
    expect(c.y).toBeCloseTo(0);
  });
  it('moving the image right shows its left part', () => {
    const s = coverScale(img, frame);
    const c = cropFromView(img, frame, s, 50, 0);
    expect(c.x).toBeCloseTo(0);
  });
  it('zooming in shrinks the crop', () => {
    const s = coverScale(img, frame) * 2;
    const c = cropFromView(img, frame, s, 0, 0);
    expect(c.w).toBeCloseTo(0.375);
    expect(c.h).toBeCloseTo(0.5);
  });
  it('always stays within the image', () => {
    for (const [tx, ty, f] of [
      [1e4, 1e4, 1],
      [-1e4, -1e4, 3],
      [0, 0, 10],
    ] as const) {
      const c = cropFromView(img, frame, coverScale(img, frame) * f, tx, ty);
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.x + c.w).toBeLessThanOrEqual(1 + 1e-9);
      expect(c.y + c.h).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe('centerCrop & pixels', () => {
  it('largest centered crop with aspect', () => {
    expect(centerCrop(img, 1)).toEqual({ x: 0.125, y: 0, w: 0.75, h: 1 });
    const portrait = centerCrop(img, 3 / 4);
    expect(portrait.h).toBe(1);
    expect((portrait.w * img.width) / (portrait.h * img.height)).toBeCloseTo(3 / 4);
  });
  it('converts to integer pixels inside the image', () => {
    expect(cropToPixels({ x: 0.125, y: 0, w: 0.75, h: 1 }, img)).toEqual({
      originX: 500,
      originY: 0,
      width: 3000,
      height: 3000,
    });
  });
});

describe('fitWithin', () => {
  it('downscales the long edge, never upscales', () => {
    expect(fitWithin(img, 1536)).toEqual({ width: 1536, height: 1152 });
    expect(fitWithin({ width: 300, height: 200 }, 1536)).toEqual({ width: 300, height: 200 });
  });
});

describe('transformHash', () => {
  const base = { rotation: 0 as const, crop: { x: 0.1, y: 0.2, w: 0.5, h: 0.5 }, maxEdge: 1536 };
  it('is deterministic and 8 hex chars', () => {
    expect(transformHash(base)).toBe(transformHash({ ...base }));
    expect(transformHash(base)).toMatch(/^[0-9a-f]{8}$/);
  });
  it('changes with rotation, crop or size', () => {
    const h = transformHash(base);
    expect(transformHash({ ...base, rotation: 90 })).not.toBe(h);
    expect(transformHash({ ...base, crop: { ...base.crop, x: 0.11 } })).not.toBe(h);
    expect(transformHash({ ...base, maxEdge: 512 })).not.toBe(h);
  });
});
