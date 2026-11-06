import { describe, expect, it } from 'vitest';

import { withAlpha } from '../src/styles/helpers.ts';
import { color, fontFace, gradient, palette, radius, spacing, touch, typography } from '../src/tokens.ts';

/** WCAG 2.x relative luminance / contrast ratio. */
function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('color tokens', () => {
  const backgrounds = [
    color.background.primary,
    color.background.secondary,
    color.background.raised,
    color.background.sunken,
    ...Object.values(color.surface),
  ];

  it.each(backgrounds)('primary text meets WCAG AA (4.5:1) on %s', (bg) => {
    expect(contrast(color.text.primary, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(backgrounds)('secondary text meets WCAG AA (4.5:1) on %s', (bg) => {
    expect(contrast(color.text.secondary, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('accent button label (navy on yellow) meets AA', () => {
    expect(contrast(color.text.onAccent, color.action.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('white on primary purple only qualifies as WCAG large text (≥3:1)', () => {
    expect(contrast(color.text.onPrimary, color.action.primary)).toBeGreaterThanOrEqual(3);
    expect(typography.button.fontSize).toBeGreaterThanOrEqual(19);
  });

  it('brand purpleStrong is usable for small text on cream', () => {
    expect(contrast(color.brand.strong, color.background.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('switch states meet WCAG 1.4.11 (3:1) on every card surface', () => {
    const cards = [color.background.raised, color.background.primary, ...Object.values(color.surface)];
    for (const bg of cards) {
      expect(contrast(color.control.on, bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(color.control.off, bg)).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(color.control.knobOn, color.control.on)).toBeGreaterThanOrEqual(3);
  });

  it('dark text stays readable on every stop of the lime → green hero gradient', () => {
    for (const stop of gradient.brand.colors) expect(contrast(color.text.primary, stop)).toBeGreaterThanOrEqual(4.5);
  });

  it('dark text stays readable on every stop of the story card gradients', () => {
    for (const g of [gradient.storySky, gradient.storySun, gradient.storyEmber])
      for (const stop of g.colors) expect(contrast(color.text.primary, stop)).toBeGreaterThanOrEqual(4.5);
  });

  it('white labels stay readable on both button gradients', () => {
    for (const g of [gradient.buttonAccent, gradient.buttonPrimary])
      for (const stop of g.colors) expect(contrast(color.text.onPrimary, stop)).toBeGreaterThanOrEqual(4.5);
  });

  it('palette contains only #RRGGBB values', () => {
    for (const v of Object.values(palette)) expect(v).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('layout tokens', () => {
  it('spacing follows the 4-pt grid', () => {
    for (const v of Object.values(spacing)) expect(v % 4).toBe(0);
  });

  it('touch targets respect child-friendly minimums', () => {
    expect(touch.min).toBeGreaterThanOrEqual(48);
    expect(touch.child).toBeGreaterThanOrEqual(56);
    expect(touch.cta).toBeGreaterThanOrEqual(64);
  });

  it('radii increase monotonically', () => {
    const r = [radius.sm, radius.md, radius.lg, radius.xl, radius.sheet];
    expect([...r].sort((a, b) => a - b)).toEqual(r);
  });
});

describe('typography tokens', () => {
  it('every weight used has a registered font face', () => {
    for (const t of Object.values(typography)) expect(fontFace[t.fontWeight]).toMatch(/^Nunito_/);
  });

  it('body text is at least 16 for children', () => {
    expect(typography.body.fontSize).toBeGreaterThanOrEqual(16);
  });
});

describe('withAlpha', () => {
  it('converts hex + alpha to rgba', () => {
    expect(withAlpha('#38334F', 0.5)).toBe('rgba(56, 51, 79, 0.5)');
  });
  it('rejects non-hex input', () => {
    expect(() => withAlpha('red', 1)).toThrow();
  });
});
