import { describe, expect, it } from 'vitest';

import { backgroundSvg } from '../src/illustrations/backgrounds.ts';
import { MASCOT_EMOTION_LIST, MASCOT_EMOTIONS, pinoSvg } from '../src/mascot/pino.ts';
import { mascotColors } from '../src/mascot/theme.ts';

describe('Pino', () => {
  it('has exactly the 8 specified emotions', () => {
    expect(MASCOT_EMOTION_LIST).toEqual([
      'greeting',
      'happy',
      'thinking',
      'surprised',
      'excited',
      'success',
      'encourage',
      'sleeping',
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

  it('keeps the signature yellow star clip and the soft 3D shading in every emotion', () => {
    for (const e of MASCOT_EMOTION_LIST) {
      const svg = pinoSvg(e, 'x');
      expect(svg).toContain(mascotColors.star);
      expect(svg).toContain('id="x-shine"');
      expect(svg).toContain('id="x-glow"');
    }
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
