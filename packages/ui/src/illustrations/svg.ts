// SVG building blocks (pure TS, returns SVG markup strings). Shared by the app
// (via react-native-svg SvgXml) and the concept-mockup renderer.
// Decorative illustration building blocks (clouds, stars, leaves, flowers,
// meadow) and the custom navigation / UI icons used in the concept mockups.
// These map 1:1 to the planned components DecorativeBackground,
// CloudIllustration and StarDecoration (docs/design/component-library.md).

import { palette as P } from '../tokens.ts';

export function starPath(cx: number, cy: number, r: number, inner = 0.5, rot = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((Math.PI * 2) / 10) * i - Math.PI / 2 + (rot * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * inner;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Soft rounded star (rounded via stroke-linejoin). */
export function star(cx: number, cy: number, r: number, fill: string = P.yellow, rot = 0, opacity = 1): string {
  return `<polygon points="${starPath(cx, cy, r, 0.52, rot)}" fill="${fill}" stroke="${fill}" stroke-width="${(r * 0.35).toFixed(1)}" stroke-linejoin="round" opacity="${opacity}"/>`;
}

/** Four-point twinkle. */
export function twinkle(cx: number, cy: number, r: number, fill: string = P.white, opacity = 0.9): string {
  return `<path d="M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z" fill="${fill}" opacity="${opacity}"/>`;
}

export function cloud(x: number, y: number, w: number, opacity = 0.9, fill: string = P.white): string {
  const s = w / 120;
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})" opacity="${opacity}">
    <path d="M14 52 Q0 52 2 40 Q4 28 20 30 Q22 12 42 12 Q56 0 72 10 Q88 4 96 22 Q118 20 118 38 Q120 52 104 52 Z" fill="${fill}"/>
  </g>`;
}

export function leaf(x: number, y: number, size: number, rot = 0, fill: string = P.green600, opacity = 0.9): string {
  const s = size / 40;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})" opacity="${opacity}">
    <path d="M0 0 Q18 -20 40 0 Q18 20 0 0Z" fill="${fill}"/>
    <path d="M2 0 Q20 -1 36 0" stroke="#fff" stroke-opacity="0.5" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </g>`;
}

export function flower(x: number, y: number, r: number, petal: string = P.peach, center: string = P.yellow): string {
  let petals = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    petals += `<circle cx="${(x + Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.62).toFixed(1)}" r="${(r * 0.5).toFixed(1)}" fill="${petal}"/>`;
  }
  return `<g>${petals}<circle cx="${x}" cy="${y}" r="${(r * 0.36).toFixed(1)}" fill="${center}"/></g>`;
}

/** Rolling meadow hill at the bottom of a screen. */
export function meadow(width: number, height: number, y: number): string {
  return `<g>
    <path d="M-20 ${y + 40} Q${width * 0.25} ${y - 30} ${width * 0.55} ${y + 10} Q${width * 0.8} ${y + 40} ${width + 20} ${y - 6} L${width + 20} ${height} L-20 ${height} Z" fill="${P.green}" opacity="0.65"/>
    <path d="M-20 ${y + 60} Q${width * 0.35} ${y - 4} ${width * 0.7} ${y + 36} Q${width * 0.88} ${y + 54} ${width + 20} ${y + 40} L${width + 20} ${height} L-20 ${height} Z" fill="url(#meadowGrad)"/>
  </g>`;
}

export function meadowDefs(): string {
  return `<linearGradient id="meadowGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E4F0C6"/><stop offset="1" stop-color="${P.green}"/></linearGradient>`;
}

/* ---------------------------------------------------------------- icons -- */
// Custom, rounded, two-tone icons (no generic icon font).

const stroke = (c: string): string => `stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

export const icon = {
  home: (active: boolean): string => `<svg width="30" height="30" viewBox="0 0 30 30">
    <path d="M5 14 L15 5 L25 14 V24 Q25 26 23 26 H7 Q5 26 5 24Z" fill="${active ? P.yellow : P.lavender100}" ${stroke(active ? P.navy : P.greyPurple)}/>
    <path d="M12 26 V19 Q12 17 14 17 H16 Q18 17 18 19 V26" fill="${active ? P.peach : '#fff'}" ${stroke(active ? P.navy : P.greyPurple)}/></svg>`,
  create: (active: boolean): string => `<svg width="30" height="30" viewBox="0 0 30 30">
    <path d="M6 9 Q6 6 9 6 H12 A3 3 0 1 1 18 6 H21 Q24 6 24 9 V12 A3 3 0 1 1 24 18 V21 Q24 24 21 24 H9 Q6 24 6 21Z" fill="${active ? P.yellow : P.lavender100}" ${stroke(active ? P.navy : P.greyPurple)}/>
    <path d="M15 11 V19 M11 15 H19" ${stroke(active ? P.navy : P.greyPurple)}/></svg>`,
  collection: (active: boolean): string => `<svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="4" y="7" width="17" height="15" rx="4" fill="${active ? P.sky : P.lavender100}" ${stroke(active ? P.navy : P.greyPurple)} transform="rotate(-8 12 14)"/>
    <rect x="9" y="9" width="17" height="15" rx="4" fill="${active ? P.yellow : '#fff'}" ${stroke(active ? P.navy : P.greyPurple)}/>
    <path d="M12 21 L16 16 L19 19 L21 17 L24 21" ${stroke(active ? P.navy : P.greyPurple)} fill="none"/></svg>`,
  awards: (active: boolean): string => `<svg width="30" height="30" viewBox="0 0 30 30">
    <polygon points="${starPath(15, 15.5, 11, 0.5)}" fill="${active ? P.yellow : P.lavender100}" ${stroke(active ? P.navy : P.greyPurple)}/></svg>`,
  back: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M13 5 L7 11 L13 17" fill="none" ${stroke(P.navy)}/></svg>`,
  chevron: (c: string = P.navy): string =>
    `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M8 5 L13 10 L8 15" fill="none" ${stroke(c)} stroke-width="3"/></svg>`,
  pause: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><rect x="6" y="5" width="3.6" height="12" rx="1.8" fill="${P.navy}"/><rect x="12.4" y="5" width="3.6" height="12" rx="1.8" fill="${P.navy}"/></svg>`,
  eye: (): string =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M2.5 12 Q12 3 21.5 12 Q12 21 2.5 12Z" fill="#fff" ${stroke(P.navy)}/><circle cx="12" cy="12" r="3.6" fill="${P.purple}"/></svg>`,
  lock: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><rect x="4.5" y="10" width="13" height="9" rx="3" fill="${P.lavender100}" ${stroke(P.greyPurple)} stroke-width="2"/><path d="M7.5 10 V8 A3.5 3.5 0 0 1 14.5 8 V10" fill="none" ${stroke(P.greyPurple)} stroke-width="2"/></svg>`,
  sort: (): string =>
    `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 6 H16 M6 10 H14 M8 14 H12" fill="none" ${stroke(P.navy)}/></svg>`,
  check: (c: string = P.white): string =>
    `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3.5 8.5 L6.5 11.5 L12.5 5" fill="none" ${stroke(c)} stroke-width="2.8"/></svg>`,
  trash: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M5 7 H17 L16 18 Q16 19.5 14.5 19.5 H7.5 Q6 19.5 6 18Z" fill="${P.peach100}" ${stroke(P.navy)} stroke-width="2"/><path d="M4 7 H18 M9 4.5 H13" fill="none" ${stroke(P.navy)} stroke-width="2"/><path d="M9.5 10.5 V16 M12.5 10.5 V16" ${stroke(P.navy)} stroke-width="1.8"/></svg>`,
  minus: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M5 11 H17" ${stroke(P.navy)} stroke-width="3"/></svg>`,
  plus: (): string =>
    `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M5 11 H17 M11 5 V17" ${stroke(P.navy)} stroke-width="3"/></svg>`,
  rotate: (): string =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 9 A7 7 0 1 0 19 14" fill="none" ${stroke(P.navy)}/><path d="M18 4 V9 H13" fill="none" ${stroke(P.navy)}/></svg>`,
  /** Illustrated tiles for the creator source picker. */
  camera: (): string => `<svg width="56" height="56" viewBox="0 0 56 56">
    <rect x="6" y="15" width="44" height="31" rx="9" fill="${P.sky}"/><rect x="18" y="9" width="16" height="9" rx="4" fill="${P.sky600}"/>
    <circle cx="28" cy="30" r="10" fill="#fff"/><circle cx="28" cy="30" r="6" fill="${P.purple}"/><circle cx="25.5" cy="27.5" r="2" fill="#fff"/>
    <circle cx="43" cy="21" r="2.4" fill="${P.yellow}"/></svg>`,
  gallery: (): string => `<svg width="56" height="56" viewBox="0 0 56 56">
    <rect x="6" y="12" width="36" height="30" rx="8" fill="${P.peach}" transform="rotate(-8 24 27)"/>
    <rect x="14" y="14" width="36" height="30" rx="8" fill="#fff" stroke="${P.peach600}" stroke-width="2.5"/>
    <path d="M18 40 L28 28 L35 35 L40 30 L47 40Z" fill="${P.mint600}"/><circle cx="40" cy="22" r="4" fill="${P.yellow}"/></svg>`,
  sample: (): string => `<svg width="56" height="56" viewBox="0 0 56 56">
    <path d="M10 14 Q10 9 15 9 H22 A5 5 0 1 1 32 9 H41 Q46 9 46 14 V22 A5 5 0 1 1 46 32 V42 Q46 47 41 47 H15 Q10 47 10 42Z" fill="${P.lavender}"/>
    <polygon points="${starPath(28, 29, 9, 0.5)}" fill="${P.yellow}" stroke="${P.yellow}" stroke-width="3" stroke-linejoin="round"/></svg>`,
};
