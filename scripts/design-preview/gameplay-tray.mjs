// Concept mockup: gameplay for large puzzles (64–256 pieces) with a piece
// tray, sorting baskets, hint highlighting and locked (snapped) pieces.
// MOCKUP – see docs/product/gameplay-concept.md.

import { palette as P, radius, shadow } from '../../packages/ui/src/tokens.ts';
import { icon, star, twinkle } from './decor.mjs';
import { jigsaw } from './jigsaw.mjs';
import { mascot } from './mascot.mjs';
import { sceneGroup } from './scenes.mjs';
import { sh, statusBar } from './screens.mjs';

const ROWS = 8;
const COLS = 8;
const SW = 400;
const SH = 300;

const isEdge = (r, c) => r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1;

function bowl(fill, rim) {
  return `<svg width="46" height="34" viewBox="0 0 46 34">
    <ellipse cx="23" cy="10" rx="20" ry="6" fill="${rim}"/>
    <path d="M3 10 Q5 31 23 31 Q41 31 43 10 Z" fill="${fill}"/>
    <ellipse cx="23" cy="10" rx="17" ry="4" fill="${P.white}" opacity=".55"/>
    <path d="M10 18 Q23 24 36 18" stroke="${P.white}" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
}

function frameIcon() {
  return `<svg width="46" height="34" viewBox="0 0 46 34"><rect x="8" y="4" width="30" height="26" rx="6" fill="none" stroke="${P.leaf600}" stroke-width="5"/>
    <rect x="14" y="10" width="18" height="14" rx="3" fill="${P.leaf100}"/></svg>`;
}

function stackIcon() {
  return `<svg width="46" height="34" viewBox="0 0 46 34">
    <rect x="9" y="12" width="20" height="17" rx="4" fill="${P.sky}" transform="rotate(-10 19 20)"/>
    <rect x="17" y="8" width="20" height="17" rx="4" fill="${P.yellow}" transform="rotate(8 27 16)"/>
    <circle cx="27" cy="6" r="4" fill="${P.yellow}"/></svg>`;
}

export function gameplayTray() {
  const { pieces } = jigsaw({ rows: ROWS, cols: COLS, width: SW, height: SH, seed: 21 });
  const at = (r, c) => pieces[r * COLS + c];
  const missingEdges = new Set([3, 4]); // row 0, cols 3 & 4 still open
  const placed = new Set();
  pieces.forEach((p, k) => {
    if (isEdge(p.row, p.col) && !(p.row === 0 && missingEdges.has(p.col))) placed.add(k);
    if (p.row >= 5 && p.row <= 6) placed.add(k);
  });
  const skyTray = pieces.map((p, k) => ({ p, k })).filter(({ p, k }) => p.row <= 2 && !placed.has(k));
  const hintPiece = at(0, 3);
  const hintIdx = 3;

  const boardX = 24;
  const boardY = 128;
  const s = 342 / SW;
  const g = sceneGroup('meadowHouse');
  const defs = pieces.map((p, k) => `<clipPath id="tc${k}"><path d="${p.d}"/></clipPath>`).join('');
  const pieceArt = (k, strokeOpacity = 0.9) => {
    const p = pieces[k];
    return `<g clip-path="url(#tc${k})"><use href="#timg"/></g>
      <path d="${p.d}" fill="none" stroke="${P.white}" stroke-width="2.2" stroke-opacity="${strokeOpacity}"/>`;
  };

  // tray slots
  const slotW = 78;
  const slotH = 70;
  const trayX = 16;
  const trayY = 522;
  const slots = skyTray.slice(0, 10).map(({ p, k }, i) => {
    const col = Math.floor(i / 2);
    const row = i % 2;
    const x = trayX + 14 + col * (slotW + 8);
    const y = trayY + 52 + row * (slotH + 10);
    const cx = x + slotW / 2;
    const cy = y + slotH / 2;
    const ts = 0.86;
    const hl = k === hintIdx;
    return `
      <rect x="${x}" y="${y}" width="${slotW}" height="${slotH}" rx="18" fill="${hl ? P.yellow100 : P.white}" stroke="${hl ? P.yellow600 : P.leaf100}" stroke-width="${hl ? 3 : 2}"/>
      ${hl ? `<rect x="${x - 4}" y="${y - 4}" width="${slotW + 8}" height="${slotH + 8}" rx="22" fill="none" stroke="${P.yellow}" stroke-width="4" opacity=".55" filter="url(#tglow)"/>` : ''}
      <g transform="translate(${cx} ${cy}) scale(${ts}) translate(${-(p.x + p.w / 2)} ${-(p.y + p.h / 2)})" filter="url(#tsoft)">${pieceArt(k)}</g>`;
  });

  const baskets = [
    { label: 'Alle', n: 26, art: stackIcon() },
    { label: 'Ränder', n: 2, art: frameIcon() },
    { label: 'Himmel', n: 14, art: bowl(P.sky, P.sky600), on: true },
    { label: 'Haus', n: 5, art: bowl(P.peach, P.peach600) },
    { label: 'Wiese', n: 7, art: bowl(P.green, P.green600) },
  ];

  return `<div class="screen table">
  ${statusBar()}
  <div class="content" style="padding-top:60px">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="round-btn" aria-label="Pause">${icon.pause()}</div>
      <div style="flex:1;background:#fff;border-radius:${radius.pill}px;height:52px;display:flex;align-items:center;gap:10px;padding:0 14px;box-shadow:${sh(shadow.card)}">
        <svg width="26" height="26" viewBox="0 0 26 26">${star(13, 13.5, 10)}</svg>
        <div class="progress" style="flex:1"><b style="width:${(38 / 64) * 100}%"></b></div>
        <span class="label">38/64</span>
      </div>
      <div class="round-btn" style="background:${P.leaf100};border:2px solid ${P.leaf}" aria-label="Vorlage zeigen">${icon.eye()}</div>
    </div>
  </div>

  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">
    <defs>
      <g id="timg">${g}</g>${defs}
      <filter id="tsoft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${P.ink}" flood-opacity=".18"/></filter>
      <filter id="tglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>

    <!-- board -->
    <rect x="${boardX - 10}" y="${boardY - 10}" width="${342 + 20}" height="${SH * s + 20}" rx="22" fill="${P.white}" filter="url(#tsoft)"/>
    <g transform="translate(${boardX} ${boardY}) scale(${s})">
      <g opacity=".07">${g}</g>
      <rect width="${SW}" height="${SH}" fill="${P.leaf100}" opacity=".45"/>
      ${pieces.map((p, k) => (placed.has(k) ? '' : `<path d="${p.d}" fill="none" stroke="${P.leaf600}" stroke-opacity=".22" stroke-width="1.6" stroke-dasharray="5 6"/>`)).join('')}
      ${[...placed].map((k) => pieceArt(k, 0.35)).join('')}
      <path d="${hintPiece.d}" fill="${P.yellow}" fill-opacity=".4" stroke="${P.yellow600}" stroke-width="6" filter="url(#tglow)"/>
      <path d="${hintPiece.d}" fill="none" stroke="${P.yellow600}" stroke-width="3.5" stroke-dasharray="8 6"/>
    </g>
    ${twinkle(boardX + 150 * s + 22, boardY + 6, 8, P.yellow600)}${twinkle(boardX + 200 * s + 18, boardY - 4, 6, P.yellow600)}

    <!-- locked piece sparkle (just snapped) -->
    ${star(boardX + 6 * 50 * s + 30, boardY + 5 * 37.5 * s + 18, 7, P.yellow)}${twinkle(boardX + 6 * 50 * s + 8, boardY + 5 * 37.5 * s + 6, 6, P.white)}

    <!-- tray panel -->
    <rect x="${trayX}" y="${trayY}" width="358" height="226" rx="30" fill="${P.white}" fill-opacity=".72" stroke="${P.white}" stroke-width="2"/>
    ${slots.join('')}
    <rect x="${trayX + 330}" y="${trayY + 52}" width="28" height="150" fill="url(#fadeR)"/>
    <defs><linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="${P.white}" stop-opacity="0"/><stop offset="1" stop-color="${P.white}" stop-opacity=".95"/></linearGradient></defs>
  </svg>

  <!-- zoom pill -->
  <div style="position:absolute;right:28px;top:${boardY + 256 - 52}px;display:flex;gap:6px;background:rgba(255,255,255,.92);border-radius:${radius.pill}px;padding:4px;box-shadow:${sh(shadow.card)}">
    <div class="round-btn" style="width:40px;height:40px;box-shadow:none;font:800 22px Nunito;color:${P.ink}">−</div>
    <div class="round-btn" style="width:40px;height:40px;box-shadow:none;font:800 22px Nunito;color:${P.ink}">+</div>
  </div>

  <!-- hint bubble -->
  <div style="position:absolute;left:70px;top:${boardY + 54}px;white-space:nowrap;box-shadow:${sh(shadow.card)};background:${P.yellow100};border:2px solid ${P.yellow};border-radius:16px;padding:6px 12px" class="label">Das gelbe Teil passt hier!</div>

  <!-- baskets -->
  <div style="position:absolute;left:16px;right:0;top:412px;display:flex;gap:8px;overflow:hidden">
    ${baskets
      .map(
        (
          b,
        ) => `<div style="flex:none;width:72px;height:96px;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:${b.on ? P.leaf100 : 'rgba(255,255,255,.8)'};border:${b.on ? `3px solid ${P.leaf}` : '2px solid #fff'};box-shadow:${sh(shadow.card)}">
        ${b.art}<div class="caption" style="color:${P.ink};font-weight:800">${b.label}</div>
        <div class="badge" style="height:20px;padding:0 7px;background:${b.on ? P.leaf600 : P.leaf100};color:${b.on ? '#fff' : P.forest}">${b.n}</div></div>`,
      )
      .join('')}
  </div>

  <!-- tray header -->
  <div style="position:absolute;left:36px;right:36px;top:${522 + 14}px;display:flex;justify-content:space-between;align-items:center">
    <div class="label">Himmel · 14 Teile</div>
    <div style="display:flex;align-items:center;gap:6px;background:${P.yellow};border-radius:${radius.pill}px;padding:2px 12px 2px 2px;box-shadow:${sh(shadow.card)}">
      <div style="width:34px;height:34px;border-radius:17px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center">${mascot({ emotion: 'thinking', size: 40 })}</div>
      <span class="label" style="color:${P.ink}">Tipp</span>
    </div>
  </div>
  <div class="homebar"></div>
</div>`;
}
