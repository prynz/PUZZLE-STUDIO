// Renders the design-concept mockups to PNG.
//
//   pnpm design:preview
//
// Output: docs/design/concept/*.png  (all files are MOCKUPS, not app screenshots)
// Requires Node ≥ 22.18 (imports the TypeScript token file directly) and a
// Playwright installation with Chromium (`npx playwright install chromium`).

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { palette as P } from '../../packages/ui/src/tokens.ts';
import { cloud, flower, leaf, star, twinkle } from './decor.mjs';
import { EMOTIONS, mascot } from './mascot.mjs';
import { gameplayTray } from './gameplay-tray.mjs';
import { SCREEN, SCREENS, css } from './screens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const outDir = join(root, 'docs/design/concept');
const fontDir = pathToFileURL(join(root, 'node_modules/@fontsource/nunito/files')).href;

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not found. Install it (e.g. `pnpm dlx playwright install chromium`) and retry.');
  process.exit(1);
}

const page = (body, extraCss = '') =>
  `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css(fontDir)}${extraCss}</style></head><body>${body}</body></html>`;

const MOCKUP_TAG = `<div style="position:absolute;right:28px;bottom:22px;font:800 13px Nunito;color:${P.greyPurple};letter-spacing:.6px">KONZEPT-MOCKUP · keine App-Screenshots</div>`;

function board() {
  const phones = SCREENS.map(
    (s) => `<div style="display:flex;flex-direction:column;align-items:center;gap:18px">
      <div style="padding:12px;border-radius:58px;background:#2E2A40;box-shadow:0 24px 50px rgba(56,51,79,.22)">
        <div style="border-radius:46px;overflow:hidden;position:relative">${s.render()}
          <div style="position:absolute;top:11px;left:50%;transform:translateX(-50%);width:110px;height:32px;border-radius:16px;background:#1d1a29;z-index:9"></div></div>
      </div>
      <div style="font:900 24px Nunito;color:${P.navy}">${s.title}</div></div>`,
  ).join('');
  const W = 2300;
  const H = 1260;
  return `<div style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:linear-gradient(160deg, #FFF3DF, ${P.pink} 60%, #F4ECFF)">
    <svg style="position:absolute;inset:0" width="${W}" height="${H}">
      ${cloud(1500, 30, 260, 0.9)}${cloud(1950, 120, 200, 0.8)}${cloud(-40, 1040, 260, 0.7)}
      ${star(720, 70, 12)}${star(1180, 110, 10, P.lavender)}${star(2240, 300, 12)}${twinkle(1350, 60, 10)}${star(40, 520, 10, P.lavender)}
      ${leaf(2180, 980, 60, 210, P.green600, 0.8)}${leaf(30, 260, 50, -20, P.mint600, 0.8)}
      ${flower(2220, 1150, 34, P.peach)}${flower(2160, 1210, 24, P.lavender)}${flower(60, 1190, 30, P.lavender)}${flower(120, 1230, 20, P.peach)}
    </svg>
    <div style="position:absolute;left:70px;top:40px;display:flex;align-items:center;gap:18px">
      ${mascot({ emotion: 'greeting', size: 120 })}
      <div><div style="font:900 56px Nunito;color:${P.purple700};letter-spacing:-1px">PUZZLE STUDIO</div>
      <div style="font:700 22px Nunito;color:${P.greyPurple}">Erstellen. Spielen. Sammeln. Entdecken.</div></div>
    </div>
    <div style="position:absolute;left:0;right:0;top:190px;display:flex;justify-content:center;gap:44px">${phones}</div>
    ${MOCKUP_TAG}
  </div>`;
}

function mascotSheet() {
  const cells = Object.entries(EMOTIONS)
    .map(
      (
        [k, e],
        i,
      ) => `<div style="background:#fff;border-radius:28px;padding:16px 10px 18px;display:flex;flex-direction:column;align-items:center;box-shadow:0 6px 18px rgba(56,51,79,.08)">
      ${mascot({ emotion: k, size: 200 })}
      <div style="font:900 20px Nunito;color:${P.navy};margin-top:6px">${i + 1}. ${e.label}</div>
      <div style="font:700 14px Nunito;color:${P.greyPurple}">emotion="${k}"</div></div>`,
    )
    .join('');
  return `<div style="width:1120px;padding:40px;background:linear-gradient(180deg, ${P.cream}, ${P.pink});position:relative">
    <div style="font:900 40px Nunito;color:${P.navy}">Pino – Maskottchen-Zustände</div>
    <div style="font:700 18px Nunito;color:${P.greyPurple};margin:4px 0 26px">Ein weiches Puzzleteil: Kopf-Nase = Puzzle-Tab, Arme = Seiten-Tabs, Lavendel-Stern als Markenzeichen.</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">${cells}</div>
    <div style="height:30px"></div>${MOCKUP_TAG}</div>`;
}

function tokenSheet() {
  const sw = [
    ['Warm Cream', P.cream, 'Haupt-Hintergrund'],
    ['Soft Pink', P.pink, 'Sekundär-Hintergrund'],
    ['Lavender', P.lavender, 'Marke'],
    ['Soft Purple', P.purple, 'Primär-Aktion'],
    ['Purple 700', P.purple700, 'Text auf Hell / Links'],
    ['Soft Yellow', P.yellow, 'Positive Aktion'],
    ['Sky Blue', P.sky, 'Ergänzung'],
    ['Mint', P.mint, 'Erfolg'],
    ['Peach', P.peach, 'Sanfter Hinweis'],
    ['Soft Green', P.green, 'Natur'],
    ['Dark Navy', P.navy, 'Text primär'],
    ['Grey Purple', P.greyPurple, 'Text sekundär'],
  ]
    .map(
      ([
        n,
        c,
        u,
      ]) => `<div style="width:160px"><div style="height:96px;border-radius:24px;background:${c};border:2px solid rgba(56,51,79,.08)"></div>
      <div style="font:900 16px Nunito;color:${P.navy};margin-top:8px">${n}</div><div style="font:700 13px Nunito;color:${P.greyPurple}">${c} · ${u}</div></div>`,
    )
    .join('');
  return `<div style="width:1120px;padding:40px;background:${P.cream};position:relative">
    <div class="t1">Design Tokens – Überblick</div>
    <div style="display:flex;flex-wrap:wrap;gap:20px;margin:24px 0 36px">${sw}</div>
    <div style="display:flex;gap:40px;align-items:flex-start">
      <div style="flex:1">
        <div class="hero">Hero 40 / Black</div><div class="t1">Titel 32 / Black</div><div class="t2">Titel 26 / ExtraBold</div>
        <div class="t3">Titel 21 / ExtraBold</div><div class="bodyL">Fließtext groß 18 / SemiBold</div><div class="body">Fließtext 16 / SemiBold</div>
        <div class="label">Label 15 / Bold</div><div class="caption">Caption 13 / Bold</div>
      </div>
      <div style="width:400px;display:flex;flex-direction:column;gap:18px">
        <div class="btn btn-accent">Los geht's <span class="chev"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M8 5 L13 10 L8 15" fill="none" stroke="${P.navy}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
        <div class="btn btn-primary">Puzzle erstellen <span class="chev"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M8 5 L13 10 L8 15" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
        <div style="display:flex;gap:8px"><div class="chip on">Ausgewählt</div><div class="chip">Chip</div><div class="btn-ghost">Überspringen</div></div>
        <div class="progress"><b style="width:62%"></b></div>
        <div style="display:flex;gap:12px;align-items:flex-end">${[12, 18, 24, 32].map((r) => `<div style="width:76px;height:64px;border-radius:${r}px;background:#fff;box-shadow:0 6px 18px rgba(56,51,79,.08);display:flex;align-items:center;justify-content:center;font:800 13px Nunito;color:${P.greyPurple}">r ${r}</div>`).join('')}</div>
      </div>
    </div>
    <div style="height:30px"></div>${MOCKUP_TAG}</div>`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), 'ps-preview-'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const shot = async (name, html, viewport, selector) => {
    const file = join(tmp, `${name}.html`);
    writeFileSync(file, html);
    const pg = await ctx.newPage();
    await pg.setViewportSize(viewport);
    await pg.goto(pathToFileURL(file).href);
    await pg.evaluate(() => document.fonts.ready);
    const el = await pg.$(selector);
    await el.screenshot({ path: join(outDir, `${name}.png`) });
    await pg.close();
    console.log('✓', `docs/design/concept/${name}.png`);
  };

  for (const s of SCREENS) {
    await shot(`concept-mockup-${s.id}`, page(s.render()), SCREEN, '.screen');
  }
  await shot('concept-mockup-gameplay-tray', page(gameplayTray()), SCREEN, '.screen');
  await shot('concept-mockup-overview', page(board()), { width: 2300, height: 1260 }, 'body > div');
  await shot('concept-mascot-sheet', page(mascotSheet()), { width: 1120, height: 900 }, 'body > div');
  await shot('concept-design-tokens', page(tokenSheet()), { width: 1120, height: 900 }, 'body > div');
  await browser.close();
}

await main();
