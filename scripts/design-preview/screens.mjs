// Concept mockups of the five key screens. Pure HTML/CSS + inline SVG,
// driven by the shared design tokens (packages/ui/src/tokens.ts).
// MOCKUPS – not screenshots of the running app.

import { color, gradient, palette as P, radius, shadow, spacing, typography } from '../../packages/ui/src/tokens.ts';
import { cloud, flower, icon, leaf, meadow, meadowDefs, star, twinkle } from './decor.mjs';
import { jigsaw } from './jigsaw.mjs';
import { mascot } from './mascot.mjs';
import { scene, sceneGroup } from './scenes.mjs';

export const SCREEN = { width: 390, height: 844 };

export const grad = (g) => `linear-gradient(${g.angle}deg, ${g.colors.join(', ')})`;
export const sh = (s) => `0 ${s.offsetY}px ${s.blur}px rgba(56,51,79,${s.opacity})`;
const type = (t) =>
  `font-size:${t.fontSize}px;line-height:${t.lineHeight}px;font-weight:${t.fontWeight};letter-spacing:${t.letterSpacing}px;`;

/** CSS shared by every mockup – every value comes from a token. */
export function css(fontDir) {
  const face = (w) =>
    `@font-face{font-family:'Nunito';font-weight:${w};src:url('${fontDir}/nunito-latin-${w}-normal.woff2') format('woff2');}`;
  return `
${[600, 700, 800, 900].map(face).join('\n')}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Nunito,sans-serif;color:${color.text.primary};-webkit-font-smoothing:antialiased}
.screen{width:${SCREEN.width}px;height:${SCREEN.height}px;position:relative;overflow:hidden;background:${grad(gradient.screenWarm)}}
.screen.dream{background:${grad(gradient.screenDream)}}
.screen.table{background:${grad(gradient.playTable)}}
.layer{position:absolute;inset:0;pointer-events:none}
.status{position:absolute;top:0;left:0;right:0;height:50px;display:flex;align-items:center;justify-content:space-between;padding:14px 30px 0 34px;font-weight:800;font-size:16px;z-index:5}
.status .icons{display:flex;gap:6px;align-items:center}
.homebar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;background:${P.ink};opacity:.85;z-index:5}
.content{position:absolute;inset:0;padding:64px ${spacing.xl}px 0;display:flex;flex-direction:column}
.hero{${type(typography.hero)}}
.t1{${type(typography.title1)}}
.t2{${type(typography.title2)}}
.t3{${type(typography.title3)}}
.bodyL{${type(typography.bodyLarge)};color:${color.text.secondary}}
.body{${type(typography.body)};color:${color.text.secondary}}
.label{${type(typography.label)}}
.caption{${type(typography.caption)};color:${color.text.secondary}}
.center{text-align:center}
.btn{height:64px;border-radius:${radius.pill}px;display:flex;align-items:center;justify-content:center;gap:10px;${type(typography.button)};position:relative;border:3px solid rgba(255,255,255,.75)}
.btn .chev{position:absolute;right:16px;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.45)}
.btn-accent{background:${grad(gradient.buttonAccent)};color:${color.text.onAccent};box-shadow:${sh(shadow.raised)}, inset 0 -4px 0 rgba(233,178,60,.35)}
.btn-primary{background:${grad(gradient.buttonPrimary)};color:#fff;box-shadow:${sh(shadow.raised)}, inset 0 -4px 0 rgba(106,85,168,.35);text-shadow:0 1px 2px rgba(56,51,79,.25)}
.btn-primary .chev{background:rgba(255,255,255,.25)}
.btn-ghost{height:48px;border-radius:${radius.pill}px;padding:0 18px;display:inline-flex;align-items:center;background:rgba(255,255,255,.7);${type(typography.label)};color:${color.text.secondary}}
.card{border-radius:${radius.lg}px;background:#fff;box-shadow:${sh(shadow.card)};border:2px solid ${color.border.card}}
.round-btn{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:${sh(shadow.card)};display:flex;align-items:center;justify-content:center}
.chip{height:44px;padding:0 18px;border-radius:${radius.pill}px;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.75);${type(typography.label)};color:${color.text.secondary};border:2px solid transparent}
.chip.on{background:${P.leaf100};color:${P.forest};border-color:${P.leaf}}
.dots{display:flex;gap:10px;justify-content:center}
.dots i{width:10px;height:10px;border-radius:5px;background:${P.leaf200}}
.dots i.on{width:28px;background:${P.leaf600}}
.nav{position:absolute;left:16px;right:16px;bottom:26px;height:76px;border-radius:${radius.xl}px;background:rgba(255,255,255,.94);box-shadow:${sh(shadow.raised)};display:flex;justify-content:space-around;align-items:center;padding:0 8px;z-index:4}
.nav .it{display:flex;flex-direction:column;align-items:center;gap:2px;width:76px;height:62px;justify-content:center;border-radius:22px;${type(typography.caption)};color:${color.text.secondary}}
.nav .it.on{background:${P.yellow100};color:${P.ink}}
.progress{height:14px;border-radius:7px;background:${P.leaf100};overflow:hidden}
.progress b{display:block;height:100%;border-radius:7px;background:linear-gradient(90deg, ${P.leaf}, ${P.leaf600})}
.badge{height:28px;padding:0 10px;border-radius:14px;display:inline-flex;align-items:center;gap:4px;${type(typography.caption)}}
`;
}

export const statusBar = () => `<div class="status"><span>9:41</span><span class="icons">
  <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="${P.ink}"/><rect x="5" y="5" width="3" height="7" rx="1" fill="${P.ink}"/><rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="${P.ink}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${P.ink}"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 L5.5 8.6 A3.6 3.6 0 0 1 10.5 8.6Z M2.8 5.8 A7.6 7.6 0 0 1 13.2 5.8 L11.6 7.6 A5.2 5.2 0 0 0 4.4 7.6Z M0 3 A11.6 11.6 0 0 1 16 3 L14.4 4.8 A9.2 9.2 0 0 0 1.6 4.8Z" fill="${P.ink}"/></svg>
  <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="${P.ink}" opacity=".5"/><rect x="2" y="2" width="17" height="8" rx="2" fill="${P.ink}"/><rect x="24" y="4" width="2" height="4" rx="1" fill="${P.ink}" opacity=".5"/></svg>
</span></div>`;

const chev = (c = P.ink) => `<span class="chev">${icon.chevron(c)}</span>`;

function nav(active) {
  const items = [
    ['home', 'Start'],
    ['create', 'Erstellen'],
    ['collection', 'Sammlung'],
    ['awards', 'Erfolge'],
  ];
  return `<div class="nav">${items.map(([k, l]) => `<div class="it ${k === active ? 'on' : ''}">${icon[k](k === active)}<span>${l}</span></div>`).join('')}</div>`;
}

/* ================================================================ 1 WELCOME */
export function welcome() {
  return `<div class="screen">
  <svg class="layer" width="390" height="844" viewBox="0 0 390 844"><defs>${meadowDefs()}</defs>
    ${cloud(-30, 96, 150, 0.95)}${cloud(250, 150, 130, 0.9)}${cloud(150, 520, 90, 0.6)}
    ${star(40, 230, 8)}${star(352, 120, 7, P.leaf)}${star(330, 330, 9)}${twinkle(70, 380, 7)}${twinkle(300, 260, 6)}${star(30, 470, 6, P.peach)}
    ${meadow(390, 844, 610)}
    ${flower(46, 710, 11, P.peach)}${flower(80, 740, 8, '#fff')}${flower(330, 690, 11, P.leaf)}${flower(355, 728, 8, P.yellow, P.peach)}${flower(300, 750, 7, '#fff', P.yellow)}
    ${leaf(22, 640, 26, -30)}${leaf(350, 610, 22, 210, P.mint600)}
  </svg>
  ${statusBar()}
  <div class="content" style="align-items:center">
    <div style="align-self:flex-end;margin-top:4px" class="btn-ghost">Überspringen</div>
    <div class="hero center" style="margin-top:22px">Hallo, ich&nbsp;bin<br/>Pino!</div>
    <div class="bodyL center" style="margin-top:12px;max-width:290px">Aus deinen Bildern werden<br/>wunderschöne Puzzles.</div>
    <div style="margin-top:34px">${mascot({ emotion: 'greeting', size: 280 })}</div>
  </div>
  <div style="position:absolute;left:24px;right:24px;bottom:56px">
    <div class="dots" style="margin-bottom:22px"><i class="on"></i><i></i><i></i></div>
    <div class="btn btn-accent">Los geht's ${chev()}</div>
  </div>
  <div class="homebar"></div>
</div>`;
}

/* =================================================================== 2 HOME */
export function home() {
  const thumb = (name, w, h, extra = '') =>
    `<div style="width:${w}px;height:${h}px;border-radius:${radius.md}px;overflow:hidden;flex:none;${extra}">${scene(name, w, h)}</div>`;
  return `<div class="screen">
  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">
    ${cloud(220, 70, 120, 0.9)}${cloud(-40, 360, 120, 0.7)}${star(360, 210, 7)}${star(26, 150, 6, P.leaf)}${twinkle(340, 470, 6)}
    ${leaf(352, 560, 22, 200, P.mint600, 0.7)}
  </svg>
  ${statusBar()}
  <div class="content" style="gap:${spacing.md}px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="badge" style="background:#fff;height:40px;padding:0 14px;border-radius:20px;font-size:16px;box-shadow:${sh(shadow.card)}">
        <svg width="22" height="22" viewBox="0 0 22 22">${star(11, 11.5, 8)}</svg> 12 Sterne</div>
      <div class="round-btn" style="width:44px;height:44px" aria-label="Elternbereich">${icon.lock()}</div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:-4px">
      ${mascot({ emotion: 'happy', size: 112 })}
      <div style="position:relative;background:#fff;border-radius:${radius.lg}px;padding:12px 16px;box-shadow:${sh(shadow.card)};flex:1">
        <div class="t3">Hallo du!</div><div class="body">Was puzzeln wir heute?</div>
        <svg style="position:absolute;left:-10px;top:30px" width="14" height="20" viewBox="0 0 14 20"><path d="M14 0 L0 10 L14 20Z" fill="#fff"/></svg>
      </div>
    </div>

    <div class="card" style="background:${grad({ colors: ['#C9BBFA', P.leaf, '#A893EA'], angle: 160 })};padding:20px;height:156px;position:relative;overflow:hidden;color:#fff;border-color:rgba(255,255,255,.6)">
      <svg style="position:absolute;right:-6px;bottom:-10px" width="170" height="160" viewBox="0 0 170 160">
        <g transform="rotate(10 90 80)"><rect x="40" y="26" width="104" height="84" rx="16" fill="#fff"/><g transform="translate(48 34)">${scene('meadowHouse', 88, 68)}</g></g>
        <path d="M18 98 Q18 88 28 88 H36 A8 8 0 1 1 52 88 H60 Q70 88 70 98 V106 A8 8 0 1 1 70 122 V130 Q70 140 60 140 H28 Q18 140 18 130Z" fill="${P.yellow}" stroke="#fff" stroke-width="3"/>
        <path d="M44 104 V124 M34 114 H54" stroke="${P.ink}" stroke-width="4.5" stroke-linecap="round"/>
        ${twinkle(150, 22, 9)}${star(26, 40, 7, '#fff')}
      </svg>
      <div class="t2" style="text-shadow:0 1px 3px rgba(106,85,168,.4)">Puzzle<br/>erstellen</div>
      <div class="label" style="margin-top:6px;color:#fff;opacity:.95">Aus deinem Foto</div>
    </div>

    <div class="card" style="padding:14px;display:flex;gap:14px;align-items:center;background:${P.yellow100}">
      ${thumb('seaBoat', 78, 78)}
      <div style="flex:1">
        <div class="caption" style="color:${P.forest}">WEITER SPIELEN</div>
        <div class="t3" style="font-size:19px">Segelboot</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px"><div class="progress" style="flex:1"><b style="width:62%"></b></div><span class="caption">10/16</span></div>
      </div>
      <div class="round-btn" style="background:${grad(gradient.buttonAccent)}"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M6 4 L16 10 L6 16Z" fill="${P.ink}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/></svg></div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px"><div class="t3">Meine Sammlung</div><div class="label" style="color:${P.forest}">Alle ›</div></div>
    <div style="display:flex;gap:12px">
      ${['meadowHouse', 'nightSky', 'garden'].map((s, i) => `<div style="position:relative">${thumb(s, 104, 92, `border:3px solid #fff;box-shadow:${sh(shadow.card)}`)}${i !== 1 ? `<div class="badge" style="position:absolute;right:6px;bottom:6px;background:${P.mint600};color:#fff;height:24px;padding:0 6px">${icon.check()}</div>` : ''}</div>`).join('')}
    </div>
  </div>
  ${nav('home')}
  <div class="homebar"></div>
</div>`;
}

/* ================================================================ 3 CREATOR */
export function creator() {
  const sizes = [4, 9, 16, 25, 36, 49, 64, 100, 144, 256];
  const sel = 16;
  const w = 342;
  const h = 212;
  const pieces = jigsaw({ rows: 4, cols: 4, width: 400, height: 300, seed: 7 }).pieces;
  return `<div class="screen dream">
  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">${cloud(250, 60, 110, 0.8)}${star(30, 110, 6, P.leaf)}${twinkle(360, 420, 6)}${cloud(-50, 760, 140, 0.7)}</svg>
  ${statusBar()}
  <div class="content" style="gap:${spacing.md}px">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="round-btn">${icon.back()}</div>
      <div style="flex:1"><div class="caption">SCHRITT 3 VON 4</div>
        <div style="display:flex;gap:6px;margin-top:6px">${[1, 2, 3, 4].map((i) => `<div style="flex:1;height:8px;border-radius:4px;background:${i <= 3 ? P.leaf600 : P.leaf200}"></div>`).join('')}</div></div>
    </div>
    <div class="t1" style="margin-top:4px">Wie viele Teile?</div>
    <div class="card" style="padding:8px;position:relative">
      <div style="border-radius:${radius.md}px;overflow:hidden;position:relative;height:${h}px">
        <svg width="${w - 20}" height="${h}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="display:block">
          ${sceneGroup('meadowHouse')}
          ${pieces.map((p) => `<path d="${p.d}" fill="none" stroke="#fff" stroke-width="3" stroke-opacity=".9"/>`).join('')}
        </svg>
      </div>
      <div class="badge" style="position:absolute;left:18px;top:18px;background:rgba(255,255,255,.92);color:${P.ink};height:32px;font-size:14px">4 × 4 · 16 Teile</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:nowrap;overflow:hidden;margin-right:-24px">
      ${sizes
        .slice(0, 6)
        .map(
          (s) =>
            `<div class="chip ${s === sel ? 'on' : ''}" style="flex:none;height:52px;min-width:56px;justify-content:center;font-size:18px;font-weight:800;${s === sel ? '' : `color:${P.ink}`}">${s}</div>`,
        )
        .join('')}
    </div>
    <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;background:${P.mint100}">
      <div style="display:flex;gap:3px">${[1, 2, 3, 4, 5].map((i) => `<svg width="22" height="22" viewBox="0 0 22 22">${star(11, 11.5, 8, i <= 2 ? P.yellow600 : '#fff')}</svg>`).join('')}</div>
      <div><div class="label">Einfach</div><div class="caption">Super für 4–7 Jahre</div></div>
    </div>
    <div class="t3" style="font-size:18px;margin-top:2px">Form der Teile</div>
    <div style="display:flex;gap:12px">
      <div class="card" style="flex:1;padding:12px;display:flex;align-items:center;gap:10px;border:3px solid ${P.leaf};background:${P.leaf100}">
        <svg width="40" height="40" viewBox="0 0 40 40"><path d="M6 10 Q6 6 10 6 H15 A5 5 0 1 1 25 6 H30 Q34 6 34 10 V15 A5 5 0 1 1 34 25 V30 Q34 34 30 34 H10 Q6 34 6 30Z" fill="${P.leaf}"/></svg>
        <div class="label">Klassisch</div></div>
      <div class="card" style="flex:1;padding:12px;display:flex;align-items:center;gap:10px">
        <svg width="40" height="40" viewBox="0 0 40 40"><rect x="7" y="7" width="26" height="26" rx="7" fill="${P.sky}"/></svg>
        <div class="label">Quadrate</div></div>
    </div>
  </div>
  <div style="position:absolute;left:24px;right:24px;bottom:48px"><div class="btn btn-primary">Puzzle erstellen ${chev('#fff')}</div></div>
  <div class="homebar"></div>
</div>`;
}

/* =============================================================== 4 GAMEPLAY */
export function gameplay() {
  const rows = 4;
  const cols = 4;
  const SW = 400;
  const SH = 300;
  const { pieces } = jigsaw({ rows, cols, width: SW, height: SH, seed: 11 });
  const placed = new Set([0, 1, 2, 4, 5, 8, 9, 12, 13, 14]);
  const scale = 342 / SW; // board width 342
  const boardX = 24;
  const boardY = 150;
  // loose pieces in the tray (screen coords offsets)
  const loose = [
    { i: 3, x: 34, y: 470, rot: -8 },
    { i: 6, x: 146, y: 488, rot: 6 },
    { i: 7, x: 262, y: 474, rot: -4 },
    { i: 10, x: 70, y: 580, rot: 10 },
    { i: 11, x: 190, y: 594, rot: -10 },
  ];
  const dragged = { i: 15, x: 286, y: 368 }; // being dragged, near its target
  const g = sceneGroup('meadowHouse');
  const defs = pieces.map((p, k) => `<clipPath id="pc${k}"><path d="${p.d}"/></clipPath>`).join('');
  const pieceSvg = (k) => {
    const p = pieces[k];
    return `<g clip-path="url(#pc${k})"><use href="#img"/></g>
      <path d="${p.d}" fill="none" stroke="#fff" stroke-width="2.2" stroke-opacity=".9"/>
      <path d="${p.d}" fill="none" stroke="${P.ink}" stroke-width="1" stroke-opacity=".12"/>`;
  };
  const pad = 22; // margin around piece cell for tabs
  const looseSvg = ({ i, x, y, rot, lifted }) => {
    const p = pieces[i];
    const cw = p.w * scale;
    const chh = p.h * scale;
    return `<g transform="translate(${x} ${y}) rotate(${rot ?? 0} ${cw / 2} ${chh / 2})" ${lifted ? 'filter="url(#lift)"' : 'filter="url(#soft)"'}>
      <g transform="scale(${lifted ? scale * 1.08 : scale}) translate(${-p.x} ${-p.y})">${pieceSvg(i)}</g></g>`;
  };
  const target = pieces[dragged.i];
  return `<div class="screen table">
  ${statusBar()}
  <div class="content" style="padding-top:60px">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="round-btn" aria-label="Pause">${icon.pause()}</div>
      <div style="flex:1;background:#fff;border-radius:${radius.pill}px;height:52px;display:flex;align-items:center;gap:10px;padding:0 14px;box-shadow:${sh(shadow.card)}">
        <svg width="26" height="26" viewBox="0 0 26 26">${star(13, 13.5, 10)}</svg>
        <div class="progress" style="flex:1"><b style="width:${(10 / 16) * 100}%"></b></div>
        <span class="label">10/16</span>
      </div>
      <div class="round-btn" style="background:${P.leaf100};border:2px solid ${P.leaf}" aria-label="Vorlage zeigen">${icon.eye()}</div>
    </div>
  </div>
  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">
    <defs>
      <g id="img">${g}</g>${defs}
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${P.ink}" flood-opacity=".18"/></filter>
      <filter id="lift" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="9" flood-color="${P.ink}" flood-opacity=".25"/></filter>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <!-- board -->
    <rect x="${boardX - 10}" y="${boardY - 10}" width="${342 + 20}" height="${SH * scale + 20}" rx="22" fill="#fff" filter="url(#soft)"/>
    <g transform="translate(${boardX} ${boardY}) scale(${scale})">
      <g opacity=".18">${g}</g>
      ${pieces.map((p) => `<path d="${p.d}" fill="none" stroke="${P.leaf600}" stroke-opacity=".25" stroke-width="1.6" stroke-dasharray="5 6"/>`).join('')}
      <path d="${target.d}" fill="${P.yellow}" fill-opacity=".35" stroke="${P.yellow600}" stroke-width="5" filter="url(#glow)"/>
      <path d="${target.d}" fill="none" stroke="${P.yellow600}" stroke-width="3"/>
      ${[...placed].map(pieceSvg).join('')}
    </g>
    <!-- tray -->
    <rect x="14" y="440" width="362" height="250" rx="30" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width="2"/>
    ${loose.map(looseSvg).join('')}
    ${looseSvg({ ...dragged, lifted: true })}
    <!-- finger hint -->
    <circle cx="${dragged.x + 50}" cy="${dragged.y + 50}" r="20" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width="3"/>
    ${twinkle(dragged.x - 6, dragged.y - 8, 9, P.yellow600)}${twinkle(dragged.x + 98, dragged.y + 4, 7, P.yellow600)}
  </svg>
  <div style="position:absolute;right:6px;bottom:22px;display:flex;align-items:flex-end">
    <div style="background:#fff;border-radius:18px;padding:8px 12px;box-shadow:${sh(shadow.card)};margin-bottom:76px;margin-right:-10px" class="label">Fast geschafft!</div>
    ${mascot({ emotion: 'encourage', size: 108 })}
  </div>
  <div class="homebar"></div>
</div>`;
}

/* ============================================================= 5 COLLECTION */
export function collection() {
  const items = [
    { s: 'meadowHouse', t: 'Unser Haus', d: '28. Okt', st: 'done', n: 16 },
    { s: 'seaBoat', t: 'Segelboot', d: '30. Okt', st: 'progress', p: 62, n: 16 },
    { s: 'nightSky', t: 'Gute Nacht', d: '24. Okt', st: 'done', n: 9 },
    { s: 'garden', t: 'Omas Garten', d: '19. Okt', st: 'new', n: 36 },
  ];
  const statusBadge = (it) =>
    it.st === 'done'
      ? `<div class="badge" style="background:${P.mint600};color:#fff">${icon.check()} Fertig</div>`
      : it.st === 'progress'
        ? `<div class="badge" style="background:${P.yellow};color:${P.ink}">${it.p}%</div>`
        : `<div class="badge" style="background:${P.leaf100};color:${P.forest}">Neu</div>`;
  return `<div class="screen">
  <svg class="layer" width="390" height="844" viewBox="0 0 390 844">${cloud(240, 56, 120, 0.9)}${star(352, 150, 7, P.leaf)}${twinkle(30, 120, 6)}</svg>
  ${statusBar()}
  <div class="content" style="gap:${spacing.md}px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
      <div class="t1">Meine Sammlung</div>
      <div class="round-btn" style="width:48px;height:48px" aria-label="Sortieren">${icon.sort()}</div>
    </div>
    <div style="display:flex;gap:8px"><div class="chip on">Alle · 4</div><div class="chip">Angefangen</div><div class="chip">Fertig</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${items
        .map(
          (it) => `<div class="card" style="padding:8px 8px 12px">
        <div style="position:relative;border-radius:${radius.md}px;overflow:hidden">${scene(it.s, 155, 128)}
          <div style="position:absolute;left:8px;top:8px">${statusBadge(it)}</div></div>
        <div class="label" style="margin:10px 4px 0;font-size:16px">${it.t}</div>
        <div style="display:flex;justify-content:space-between;margin:2px 4px 0" class="caption"><span>${it.n} Teile</span><span>${it.d}</span></div>
        ${it.st === 'progress' ? `<div class="progress" style="height:8px;margin:8px 4px 0"><b style="width:${it.p}%"></b></div>` : ''}
      </div>`,
        )
        .join('')}
    </div>
  </div>
  ${nav('collection')}
  <div class="homebar"></div>
</div>`;
}

export const SCREENS = [
  { id: 'welcome', title: '1. Willkommen', render: welcome },
  { id: 'home', title: '2. Start', render: home },
  { id: 'creator', title: '3. Puzzle erstellen', render: creator },
  { id: 'gameplay', title: '4. Puzzeln', render: gameplay },
  { id: 'collection', title: '5. Sammlung', render: collection },
];
