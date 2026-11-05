import { describe, expect, it } from 'vitest';

import { backgroundSvg } from '../src/illustrations/backgrounds.ts';
import { MASCOT_EMOTION_LIST, MASCOT_EMOTIONS, pinoSvg } from '../src/mascot/pino.ts';
import { mascotColors } from '../src/mascot/theme.ts';

describe('Pino', () => {
  it('has exactly the specified emotions', () => {
    expect(MASCOT_EMOTION_LIST).toEqual([
      'greeting',
      'happy',
      'thinking',
      'surprised',
      'excited',
      'success',
      'encourage',
      'sleeping',
      'guard',
    ]);
  });

  it.each(MASCOT_EMOTION_LIST)('%s renders a self-contained SVG', (emotion) => {
    const svg = pinoSvg(emotion, 'test');
    expect(svg.startsWith('<svg viewBox="0 0 240 240"')).toBe(true);
    expect(svg.trim().endsWith('</svg>')).toBe(true);
    // no font-dependent text on native
    expect(svg).not.toContain('<text');
    // every referenced gradient is defined with the instance prefix
    for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) expect(svg).toContain(`id="${ref[1]}"`);
    expect(MASCOT_EMOTIONS[emotion].label.length).toBeGreaterThan(0);
  });

  it('is deterministic for a given prefix and isolates instances', () => {
    expect(pinoSvg('happy', 'a')).toBe(pinoSvg('happy', 'a'));
    expect(pinoSvg('happy', 'a')).not.toBe(pinoSvg('happy', 'b'));
  });

  it('is always the glossy lime-to-teal puzzle piece with a neon touch', () => {
    for (const e of MASCOT_EMOTION_LIST) {
      const svg = pinoSvg(e, 'x');
      expect(svg).toContain(mascotColors.lime);
      expect(svg).toContain(mascotColors.teal);
      expect(svg).toContain('id="x-shine"');
      expect(svg).toContain('id="x-clip"');
    }
    // every emotion except the calm 'guard' carries a neon extra
    expect(MASCOT_EMOTION_LIST.filter((e) => pinoSvg(e, 'y').includes(mascotColors.neon))).toHaveLength(8);
  });
});

describe('background presets', () => {
  it.each(['meadow', 'sky', 'dream'] as const)('%s builds an SVG sized to the screen', (preset) => {
    const svg = backgroundSvg(preset, 390, 844);
    expect(svg).toContain('viewBox="0 0 390 844"');
  });

  it('keeps the gameplay table and calm screens free of decoration', () => {
    expect(backgroundSvg('table', 390, 844)).toBe('');
    expect(backgroundSvg('calm', 390, 844)).toBe('');
  });
});

describe('delivered Pino artwork', () => {
  it('only names known emotions and existing files', async () => {
    const { MASCOT_ART_FILES } = await import('../src/mascot/art.ts');
    const { existsSync } = await import('node:fs');
    for (const [emotion, file] of Object.entries(MASCOT_ART_FILES)) {
      expect(MASCOT_EMOTION_LIST).toContain(emotion);
      expect(existsSync(new URL(`../assets/mascot/${file}`, import.meta.url))).toBe(true);
    }
  });

  it('bundles exactly the listed files', async () => {
    const { MASCOT_ART_FILES } = await import('../src/mascot/art.ts');
    const { readFileSync } = await import('node:fs');
    const sources = readFileSync(new URL('../src/mascot/artSources.ts', import.meta.url), 'utf8');
    for (const [emotion, file] of Object.entries(MASCOT_ART_FILES))
      expect(sources).toContain(`import ${emotion} from '../../assets/mascot/${file}'`);
  });
});

describe('painted backgrounds', () => {
  it('always cover the screen and keep the focus point (meadow at the bottom)', async () => {
    const { coverLayout } = await import('../src/illustrations/backgroundArt.ts');
    const art = { width: 1785, height: 881, focus: { x: 0.5, y: 1 } };
    for (const [w, h] of [
      [390, 844],
      [498, 1138],
      [1024, 1366],
      [1440, 900],
    ] as const) {
      const l = coverLayout(art, w, h);
      expect(l.width).toBeGreaterThanOrEqual(w - 0.01);
      expect(l.height).toBeGreaterThanOrEqual(h - 0.01);
      expect(l.left).toBeLessThanOrEqual(0.01);
      expect(l.left + l.width).toBeGreaterThanOrEqual(w - 0.01);
      expect(l.top + l.height).toBeCloseTo(h); // bottom edge stays at the bottom
      expect(l.width / l.height).toBeCloseTo(1785 / 881); // never distorted
    }
  });
});
