import { palette as P } from '../tokens.ts';
import { cloud, flower, leaf, meadow, meadowDefs, star, twinkle } from './svg.ts';

export type BackgroundPreset = 'meadow' | 'sky' | 'dream' | 'table' | 'calm';

/** Builds the illustration layer for a preset. Positions are relative so every screen size works. */
export function backgroundSvg(preset: BackgroundPreset, w: number, h: number): string {
  const x = (f: number) => Math.round(w * f);
  const y = (f: number) => Math.round(h * f);
  let body = '';
  let defs = '';
  switch (preset) {
    case 'meadow':
      defs = meadowDefs();
      body =
        cloud(x(-0.08), y(0.11), w * 0.38, 0.95) +
        cloud(x(0.64), y(0.18), w * 0.33, 0.9) +
        star(x(0.1), y(0.27), 8) +
        star(x(0.9), y(0.14), 7, P.leaf) +
        star(x(0.85), y(0.39), 9) +
        twinkle(x(0.18), y(0.45), 7) +
        twinkle(x(0.77), y(0.31), 6) +
        meadow(w, h, y(0.72)) +
        flower(x(0.12), y(0.84), 11, P.peach) +
        flower(x(0.2), y(0.88), 8, P.white) +
        flower(x(0.85), y(0.82), 11, P.leaf) +
        flower(x(0.91), y(0.86), 8, P.yellow, P.peach) +
        leaf(x(0.06), y(0.76), 26, -30) +
        leaf(x(0.9), y(0.72), 22, 210, P.mint600);
      break;
    case 'sky':
      body =
        cloud(x(0.56), y(0.08), w * 0.31, 0.9) +
        cloud(x(-0.1), y(0.43), w * 0.31, 0.7) +
        star(x(0.92), y(0.25), 7) +
        star(x(0.07), y(0.18), 6, P.leaf) +
        twinkle(x(0.87), y(0.56), 6) +
        leaf(x(0.9), y(0.66), 22, 200, P.mint600, 0.7);
      break;
    case 'dream':
      body =
        cloud(x(0.64), y(0.07), w * 0.28, 0.8) +
        star(x(0.08), y(0.13), 6, P.leaf) +
        twinkle(x(0.92), y(0.5), 6) +
        cloud(x(-0.13), y(0.9), w * 0.36, 0.7) +
        star(x(0.86), y(0.3), 8) +
        twinkle(x(0.15), y(0.62), 7);
      break;
    case 'table':
    case 'calm':
      return '';
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}
