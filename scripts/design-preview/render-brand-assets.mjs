// Renders interim app icon / adaptive icon / splash / favicon from the Pino
// mascot geometry into apps/mobile/assets/brand/.
//
//   pnpm brand:assets
//
// Interim assets for development builds – final icon polishing is Phase 9.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { palette as P } from '../../packages/ui/src/tokens.ts';
import { star, twinkle } from './decor.mjs';
import { mascot } from './mascot.mjs';
import { scene } from './scenes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const outDir = join(root, 'apps/mobile/assets/brand');

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not found. Install it (e.g. `pnpm dlx playwright install chromium`) and retry.');
  process.exit(1);
}

const bg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" style="position:absolute;inset:0">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${P.cream}"/><stop offset="0.6" stop-color="${P.pink}"/><stop offset="1" stop-color="${P.lavender100}"/></linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${star(170, 190, 34, P.yellow, 12)}${star(860, 250, 26, P.lavender, -10)}${twinkle(820, 820, 30, '#fff')}${star(190, 830, 22, P.peach, 8)}
</svg>`;

const box = (size, inner, transparent) =>
  `<div id="a" style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;${transparent ? '' : `background:${P.cream}`}">${inner}</div>`;

const ASSETS = [
  // iOS / generic icon: full-bleed background + mascot (opaque)
  {
    file: 'icon.png',
    size: 1024,
    transparent: false,
    html: () =>
      box(
        1024,
        bg(1024) + `<div style="position:relative;margin-top:30px">${mascot({ emotion: 'happy', size: 780 })}</div>`,
        false,
      ),
  },
  // Android adaptive: foreground must keep the mascot inside the 66% safe zone
  {
    file: 'android-icon-foreground.png',
    size: 1024,
    transparent: true,
    html: () => box(1024, `<div style="margin-top:24px">${mascot({ emotion: 'happy', size: 560 })}</div>`, true),
  },
  { file: 'android-icon-background.png', size: 1024, transparent: false, html: () => box(1024, bg(1024), false) },
  {
    file: 'android-icon-monochrome.png',
    size: 1024,
    transparent: true,
    html: () =>
      box(
        1024,
        `<div style="margin-top:24px;filter:brightness(0)">${mascot({ emotion: 'happy', size: 560 })}</div>`,
        true,
      ),
  },
  {
    file: 'splash-icon.png',
    size: 1024,
    transparent: true,
    html: () => box(1024, mascot({ emotion: 'greeting', size: 940 }), true),
  },
  // Sample pictures (own illustrations) – "Beispielbilder" in the creator and the benchmark image
  ...[
    ['meadow-house', 'meadowHouse'],
    ['sea-boat', 'seaBoat'],
    ['night-sky', 'nightSky'],
    ['garden', 'garden'],
  ].map(([file, name]) => ({
    file: `../samples/${file}.jpg`,
    size: 1200,
    height: 900,
    transparent: false,
    html: () => `<div id="a" style="width:1200px;height:900px">${scene(name, 1200, 900)}</div>`,
  })),
  {
    file: 'favicon.png',
    size: 48,
    transparent: false,
    html: () =>
      box(
        48,
        `<div style="transform:scale(${48 / 1024});transform-origin:center;position:absolute;width:1024px;height:1024px;left:${(48 - 1024) / 2}px;top:${(48 - 1024) / 2}px">${box(1024, bg(1024) + `<div style="position:relative;margin-top:30px">${mascot({ emotion: 'happy', size: 780 })}</div>`, false)}</div>`,
        false,
      ),
  },
];

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, '../samples'), { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'ps-brand-'));
const browser = await chromium.launch();
for (const a of ASSETS) {
  const file = join(tmp, `${a.file.replaceAll('/', '_')}.html`);
  writeFileSync(
    file,
    `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{background:transparent}</style></head><body>${a.html()}</body></html>`,
  );
  const pg = await browser.newPage({ viewport: { width: a.size, height: a.height ?? a.size }, deviceScaleFactor: 1 });
  await pg.goto(pathToFileURL(file).href);
  const jpeg = a.file.endsWith('.jpg');
  await (
    await pg.$('#a')
  ).screenshot({ path: join(outDir, a.file), ...(jpeg ? { quality: 88 } : { omitBackground: a.transparent }) });
  await pg.close();
  console.log('✓', `apps/mobile/assets/brand/${a.file}`);
}
await browser.close();
