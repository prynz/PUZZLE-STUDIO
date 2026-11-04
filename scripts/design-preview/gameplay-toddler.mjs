// Concept mockup: "Häppchen-Modus" for the toddler profile (approx. 3–5 years).
// A large puzzle (here 256 pieces) is split into small picture regions
// ("Häppchen"). Only the active region is shown, zoomed in; the tray holds a
// few big pieces of that region only. No text, no sorting, no naming.
// MOCKUP – see docs/product/gameplay-concept.md §7.

import { palette as P, radius, shadow } from '../../packages/ui/src/tokens.ts';
import { icon, star, twinkle } from './decor.mjs';
import { jigsaw } from './jigsaw.mjs';
import { mascot } from './mascot.mjs';
import { sceneGroup } from './scenes.mjs';
import { sh, statusBar } from './screens.mjs';

const ROWS = 16;
const COLS = 16;
const SW = 400;
const SH = 300;
// active region ("Häppchen"): rows 6–9, cols 9–12 → the sailing boat
const R0 = 6;
const C0 = 9;
const RN = 4;
const CN = 4;

export function gameplayToddler() {
  const { pieces } = jigsaw({ rows: ROWS, cols: COLS, width: SW, height: SH, seed: 5 });
  const pw = SW / COLS;
  const ph = SH / ROWS;
  const region = pieces.filter((p) => p.row >= R0 && p.row < R0 + RN && p.col >= C0 && p.col < C0 + CN);
  const regionIds = new Set(region.map((p) => p.row * COLS + p.col));
  // pieces finished before this region (rows 0–3 complete) + some of the region
  const placed = new Set();
  pieces.forEach((p, k) => {
    if (p.row < R0 || (p.row < R0 + RN && p.col < C0)) placed.add(k);
  });
  [...regionIds].slice(0, 9).forEach((k) => placed.add(k));
  const trayPieces = [...regionIds].filter((k) => !placed.has(k)).slice(0, 3);
  const hint = trayPieces[0];

  // board viewport = zoom on the region (+ a little context)
  const vx = C0 * pw - pw * 0.6;
  const vy = R0 * ph - ph * 0.6;
  const vw = CN * pw + pw * 1.2;
  const vh = RN * ph + ph * 1.2;
  const boardX = 24;
  const boardY = 128;
  const boardW = 342;
  const z = boardW / vw;
  const boardH = vh * z;

  const g = sceneGroup('seaBoat');
  const defs = pieces
    .filter((p, k) => placed.has(k) || regionIds.has(k))
    .map((p) => `<clipPath id="kc${p.row * COLS + p.col}"><path d="${p.d}"/></clipPath>`)
    .join('');
  const art = (k, op = 0.5) => {
    const p = pieces[k];
    return `<g clip-path="url(#kc${k})"><use href="#kimg"/></g><path d="${p.d}" fill="none" stroke="${P.white}" stroke-width="0.8" stroke-opacity="${op}"/>`;
  };

  const slot = (k, i) => {
    const p = pieces[k];
    const w = 104;
    const h = 104;
    const x = 22 + i * (w + 14);
    const y = 428;
    const sc = 2.05;
    const hl = k === hint;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${hl ? P.yellow100 : P.white}" stroke="${hl ? P.yellow600 : P.leaf100}" stroke-width="${hl ? 4 : 2}"/>
      ${hl ? `<rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" rx="32" fill="none" stroke="${P.yellow}" stroke-width="5" opacity=".5" filter="url(#kglow)"/>` : ''}
      <g transform="translate(${x + w / 2} ${y + h / 2}) scale(${sc}) translate(${-(p.x + p.w / 2)} ${-(p.y + p.h / 2)})" filter="url(#ksoft)">${art(k, 0.9)}</g>`;
  };

  // overview strip: all regions as dots (done / active / open)
  const regionsTotal = 16;
  const done = 5;
  const dots = Array.from({ length: regionsTotal }, (_, i) => {
    const st = i < done ? 'done' : i === done ? 'active' : 'open';
    const fill = st === 'done' ? P.mint600 : st === 'active' ? P.yellow600 : P.leaf200;
    const r = st === 'active' ? 7 : 5;
    return `<circle cx="${12 + i * 17}" cy="12" r="${r}" fill="${fill}"/>`;
  }).join('');

  return `<div class="screen table">
  ${statusBar()}
  <div class="content" style="padding-top:60px">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="round-btn" style="flex:none" aria-label="Pause">${icon.pause()}</div>
      <div style="flex:1;background:#fff;border-radius:${radius.pill}px;height:52px;display:flex;align-items:center;justify-content:center;box-shadow:${sh(shadow.card)}">
        <svg width="270" height="24" viewBox="0 0 270 24" aria-label="Häppchen 6 von 16">${dots}</svg>
      </div>
    </div>
  </div>

  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">
    <defs>
      <g id="kimg">${g}</g>${defs}
      <clipPath id="kview"><rect x="0" y="0" width="${boardW}" height="${boardH}" rx="18"/></clipPath>
      <filter id="ksoft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${P.ink}" flood-opacity=".2"/></filter>
      <filter id="kglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>

    <rect x="${boardX - 10}" y="${boardY - 10}" width="${boardW + 20}" height="${boardH + 20}" rx="26" fill="${P.white}" filter="url(#ksoft)"/>
    <g transform="translate(${boardX} ${boardY})" clip-path="url(#kview)">
      <rect width="${boardW}" height="${boardH}" fill="${P.leaf100}"/>
      <g transform="scale(${z}) translate(${-vx} ${-vy})">
        <g opacity=".22">${g}</g>
        ${[...placed].map((k) => art(k, 0.25)).join('')}
        ${[...regionIds]
          .filter((k) => !placed.has(k))
          .map(
            (k) =>
              `<path d="${pieces[k].d}" fill="${P.white}" fill-opacity=".55" stroke="${P.leaf600}" stroke-opacity=".45" stroke-width="0.6" stroke-dasharray="2 2"/>`,
          )
          .join('')}
        <path d="${pieces[hint].d}" fill="${P.yellow}" fill-opacity=".5" stroke="${P.yellow600}" stroke-width="1.6" filter="url(#kglow)"/>
        <path d="${pieces[hint].d}" fill="none" stroke="${P.yellow600}" stroke-width="1" stroke-dasharray="3 2"/>
        <rect x="${C0 * pw}" y="${R0 * ph}" width="${CN * pw}" height="${RN * ph}" fill="none" stroke="${P.white}" stroke-width="1.2" rx="3"/>
      </g>
    </g>
    ${twinkle(boardX + 300, boardY + 30, 9, P.yellow600)}${star(boardX + 24, boardY + boardH - 26, 8, P.yellow)}

    <!-- mini map -->
    <g transform="translate(${boardX + boardW - 92} ${boardY + 10})">
      <rect x="-4" y="-4" width="88" height="68" rx="12" fill="${P.white}" filter="url(#ksoft)"/>
      <svg x="0" y="0" width="80" height="60" viewBox="0 0 ${SW} ${SH}">${sceneGroup('seaBoat')}</svg>
      <rect x="${(C0 * pw * 80) / SW}" y="${(R0 * ph * 60) / SH}" width="${(CN * pw * 80) / SW}" height="${(RN * ph * 60) / SH}" fill="none" stroke="${P.yellow600}" stroke-width="2.5" rx="2"/>
    </g>

    <!-- tray: only a few big pieces of the active region -->
    <rect x="12" y="414" width="366" height="132" rx="34" fill="${P.white}" fill-opacity=".72" stroke="${P.white}" stroke-width="2"/>
    ${trayPieces.map(slot).join('')}
  </svg>

  <!-- big Pino hint button (no text needed) -->
  <div style="position:absolute;left:50%;transform:translateX(-50%);top:580px;width:88px;height:88px;border-radius:44px;background:${P.yellow};display:flex;align-items:center;justify-content:center;box-shadow:${sh(shadow.raised)};border:4px solid #fff" aria-label="Pino hilft">
    ${mascot({ emotion: 'encourage', size: 84 })}
  </div>
  <div class="homebar"></div>
</div>`;
}
