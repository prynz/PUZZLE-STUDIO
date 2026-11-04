// Illustrated sample pictures (stand-ins for "Beispielbilder" and user photos
// in the concept mockups). Each scene is drawn in a 400×300 coordinate space.

import { palette as P } from '../../packages/ui/src/tokens.ts';
import { cloud, flower, star, twinkle } from './decor.mjs';

const W = 400;
const H = 300;

function meadowHouse(id) {
  return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD6F0"/><stop offset="1" stop-color="#E3F4FB"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
  <circle cx="320" cy="64" r="34" fill="${P.yellow}"/><circle cx="320" cy="64" r="46" fill="${P.yellow}" opacity="0.3"/>
  ${cloud(40, 40, 110)}${cloud(190, 70, 80, 0.85)}
  <path d="M0 200 Q100 140 210 190 Q300 230 400 170 V300 H0Z" fill="#BFDDA0"/>
  <path d="M0 240 Q120 200 240 236 Q330 260 400 230 V300 H0Z" fill="#A6CF84"/>
  <rect x="88" y="148" width="92" height="74" rx="8" fill="#FFF3E2"/>
  <path d="M78 154 L134 108 L190 154Z" fill="${P.peach600}" stroke="${P.peach600}" stroke-width="10" stroke-linejoin="round"/>
  <rect x="122" y="180" width="24" height="42" rx="10" fill="${P.leaf600}"/>
  <rect x="98" y="164" width="18" height="18" rx="4" fill="${P.sky}"/><rect x="152" y="164" width="18" height="18" rx="4" fill="${P.sky}"/>
  <rect x="268" y="150" width="12" height="60" rx="6" fill="#B98A62"/>
  <circle cx="274" cy="140" r="34" fill="#8FC46E"/><circle cx="256" cy="152" r="22" fill="#9FCF7F"/><circle cx="294" cy="152" r="22" fill="#86BB66"/>
  <circle cx="264" cy="132" r="5" fill="${P.peach}"/><circle cx="286" cy="146" r="5" fill="${P.peach}"/>
  ${flower(40, 256, 12, P.peach)}${flower(78, 272, 9, '#fff')}${flower(330, 262, 12, P.leaf)}${flower(366, 278, 9, P.yellow, P.peach)}${flower(220, 270, 10, '#fff', P.yellow)}`;
}

function seaBoat(id) {
  return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9C7"/><stop offset="1" stop-color="#FFF1DC"/></linearGradient>
  <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0EC"/><stop offset="1" stop-color="#5FB2DA"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
  <circle cx="110" cy="150" r="54" fill="${P.yellow}" opacity="0.9"/>
  ${cloud(240, 40, 120, 0.9)}${cloud(20, 30, 80, 0.8)}
  <rect y="160" width="${W}" height="140" fill="url(#${id}-sea)"/>
  <path d="M0 180 Q25 172 50 180 T100 180 T150 180 T200 180 T250 180 T300 180 T350 180 T400 180" stroke="#fff" stroke-opacity="0.6" stroke-width="4" fill="none"/>
  <path d="M0 220 Q25 212 50 220 T100 220 T150 220 T200 220 T250 220 T300 220 T350 220 T400 220" stroke="#fff" stroke-opacity="0.45" stroke-width="4" fill="none"/>
  <path d="M220 196 H330 Q320 226 296 226 H252 Q230 226 220 196Z" fill="${P.peach600}"/>
  <rect x="272" y="96" width="6" height="100" fill="#8F6A4F"/>
  <path d="M280 100 L280 186 L330 186Z" fill="#fff"/><path d="M270 110 L270 186 L230 186Z" fill="${P.yellow}"/>
  <path d="M0 270 Q120 250 220 280 L220 300 H0Z" fill="#FFE7B8"/>
  ${star(60, 268, 10, P.peach)}${star(150, 284, 7, P.leaf)}`;
}

function nightSky(id) {
  let stars = '';
  const pts = [
    [40, 40],
    [90, 90],
    [150, 30],
    [210, 70],
    [260, 20],
    [350, 110],
    [30, 140],
    [120, 150],
    [300, 60],
    [380, 40],
  ];
  pts.forEach(([x, y], i) => {
    stars += i % 3 === 0 ? star(x, y, 7, P.yellow) : twinkle(x, y, 6);
  });
  return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C6CC4"/><stop offset="1" stop-color="#B9A7F8"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars}
  <circle cx="300" cy="90" r="40" fill="#FFF3C4"/><circle cx="318" cy="78" r="36" fill="#7C6CC4" opacity="0.0"/>
  <circle cx="288" cy="80" r="6" fill="#F7E3A0"/><circle cx="312" cy="104" r="8" fill="#F7E3A0"/>
  ${cloud(40, 170, 120, 0.35)}
  <path d="M0 230 Q90 180 190 220 Q290 260 400 210 V300 H0Z" fill="#6A5BAF"/>
  <path d="M0 260 Q140 230 260 262 Q340 280 400 262 V300 H0Z" fill="#5A4C9C"/>
  <rect x="90" y="196" width="40" height="34" rx="6" fill="#4E4290"/><path d="M84 200 L110 178 L136 200Z" fill="#4E4290"/>
  <rect x="104" y="206" width="12" height="12" rx="3" fill="${P.yellow}"/>`;
}

function garden(id) {
  let fl = '';
  const cols = [P.peach, P.leaf, P.yellow, '#fff', P.pink300, P.sky];
  for (let i = 0; i < 14; i++) {
    const x = 20 + ((i * 53) % 380);
    const y = 170 + ((i * 37) % 110);
    fl += `<path d="M${x} ${y + 10} Q${x + 4} ${y + 40} ${x} ${y + 80}" stroke="#86BB66" stroke-width="4" fill="none"/>`;
    fl += flower(x, y, 14 + (i % 3) * 3, cols[i % cols.length], i % 2 ? P.yellow : P.peach600);
  }
  return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9EEDC"/><stop offset="1" stop-color="#F1F7E6"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
  ${cloud(250, 30, 110)}${cloud(30, 60, 70, 0.8)}
  <path d="M0 180 Q200 150 400 186 V300 H0Z" fill="#BFDDA0"/>
  ${fl}
  <g transform="translate(70 70)"><ellipse cx="0" cy="0" rx="14" ry="10" fill="${P.peach}" transform="rotate(-30)"/><ellipse cx="12" cy="4" rx="14" ry="10" fill="${P.peach}" transform="rotate(30 12 4)"/><rect x="3" y="-6" width="4" height="16" rx="2" fill="${P.ink}"/></g>`;
}

const SCENES = { meadowHouse, seaBoat, nightSky, garden };

let n = 0;
/** Returns an inline <svg> of a scene at the given size (keeps 4:3, slices). */
export function scene(name, width, height = (width * 3) / 4, extraStyle = '') {
  const id = `sc${++n}`;
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" style="display:block;${extraStyle}">${SCENES[name](id)}</svg>`;
}

/** Scene content as a <g> (for use inside clip paths). */
export function sceneGroup(name) {
  const id = `sg${++n}`;
  return SCENES[name](id);
}

export const SCENE_SIZE = { W, H };
