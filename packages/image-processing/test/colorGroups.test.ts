import { describe, expect, it } from 'vitest';

import { colorName, pieceColorGroups, suggestName, type PieceColor } from '../src/colorGroups.ts';

const SKY: [number, number, number] = [150, 210, 240];
const GRASS: [number, number, number] = [130, 190, 110];
const ROOF: [number, number, number] = [240, 140, 120];

function scene(): PieceColor[] {
  const out: PieceColor[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const y = (r + 0.5) / 8;
      const base = r < 3 ? SKY : r > 4 ? GRASS : c > 2 && c < 5 ? ROOF : SKY;
      const jitter = ((r * 7 + c * 13) % 9) - 4;
      out.push({ rgb: [base[0] + jitter, base[1] - jitter, base[2] + jitter], y });
    }
  }
  return out;
}

describe('color names', () => {
  it('maps hues to child-friendly German names', () => {
    expect(colorName([60, 120, 220])).toBe('Blau');
    expect(colorName([90, 180, 80])).toBe('Grün');
    expect(colorName([250, 220, 80])).toBe('Gelb');
    expect(colorName([200, 40, 40])).toBe('Rot');
    expect(colorName([250, 250, 250])).toBe('Weiß');
    expect(colorName([128, 128, 128])).toBe('Grau');
  });
  it('suggests speaking names only when the position is unambiguous', () => {
    expect(suggestName(SKY, 0.2)).toBe('Himmel');
    expect(suggestName(SKY, 0.8)).toBe('Blau');
    expect(suggestName(GRASS, 0.8)).toBe('Wiese');
    expect(suggestName(GRASS, 0.2)).toBe('Grün');
  });
});

describe('pieceColorGroups', () => {
  it('assigns every piece exactly once', () => {
    const groups = pieceColorGroups(scene(), 3);
    const all = groups.flatMap((g) => g.members).sort((a, b) => a - b);
    expect(all).toEqual(Array.from({ length: 64 }, (_, i) => i));
  });

  it('finds sky, meadow and roof in a simple scene', () => {
    const names = pieceColorGroups(scene(), 3).map((g) => g.name);
    expect(names).toContain('Himmel');
    expect(names).toContain('Wiese');
    expect(names.some((n) => n === 'Orange' || n === 'Rot' || n === 'Rosa')).toBe(true);
  });

  it('is deterministic', () => {
    expect(pieceColorGroups(scene())).toEqual(pieceColorGroups(scene()));
  });

  it('orders groups by size and makes duplicate names unique', () => {
    const blues: PieceColor[] = [
      ...Array.from({ length: 6 }, () => ({ rgb: [40, 80, 200] as const, y: 0.9 })),
      ...Array.from({ length: 3 }, () => ({ rgb: [100, 140, 250] as const, y: 0.9 })),
    ];
    const g = pieceColorGroups(blues, 2);
    expect(g[0]?.members.length).toBe(6);
    expect(g.map((x) => x.name)).toEqual(['Blau', 'Blau 2']);
  });

  it('handles empty input and k larger than pieces', () => {
    expect(pieceColorGroups([])).toEqual([]);
    expect(pieceColorGroups([{ rgb: [1, 2, 3], y: 0 }], 5)).toHaveLength(1);
  });
});
