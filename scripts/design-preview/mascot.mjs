// PUZZLE STUDIO mascot "Pino" – concept SVG generator.
//
// Planning artifact: produces the SVG used in the concept mockups and the
// mascot sheet. In Phase 2 the same geometry is ported to a React Native
// <Mascot emotion="…" /> component (react-native-svg). See
// docs/design/mascot-guidelines.md.
//
// Character: a chubby, soft puzzle piece. The top "tab" of the piece is his
// head tuft, the side tabs are his arms, a small lavender star clip is his
// signature accessory.

const C = {
  bodyLight: '#FFF0B8',
  body: '#FFE18A',
  bodyDark: '#F8C95A',
  outline: '#E9A93C',
  foot: '#F3B94A',
  eye: '#38334F',
  cheek: '#FFA996',
  mouth: '#5A3D52',
  tongue: '#FF9C8A',
  star: '#B9A7F8',
  starDark: '#9983D4',
};

/** Unique id prefix per rendered instance (gradients must not collide). */
let counter = 0;

/** Body = rounded square with the puzzle tab on top. viewBox 0 0 240 240. */
const BODY =
  'M96 82 L99 82 Q104 82 104 77 A24 24 0 1 1 136 77 Q136 82 141 82 L144 82 ' +
  'Q194 82 194 130 L194 160 Q194 206 146 206 L94 206 Q46 206 46 160 L46 130 Q46 82 96 82 Z';

function star(cx, cy, r, fill, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = ((Math.PI * 2) / 10) * i - Math.PI / 2 + (rot * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * 0.5;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="${r * 0.28}" stroke-linejoin="round"/>`;
}

// ---- arms (side puzzle tabs) ---------------------------------------------
// Each arm is a rounded capsule anchored at the shoulder.
function arm(side, pose, id) {
  const sx = side === 'left' ? 58 : 182; // shoulder x
  const sy = 146;
  const dir = side === 'left' ? -1 : 1;
  // angle in degrees, 0 = pointing straight down, 90 = sideways out
  const angles = {
    down: 28,
    wave: 145,
    up: 140,
    point: 110,
    rest: 22,
  };
  const a = angles[pose] ?? 28;
  const len = 40;
  const rad = (a * Math.PI) / 180;
  const ex = sx + dir * Math.sin(rad) * len;
  const ey = sy + Math.cos(rad) * len;
  return (
    `<line x1="${sx}" y1="${sy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="url(#${id}-arm)" stroke-width="30" stroke-linecap="round"/>` +
    `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="15" fill="none" stroke="${C.outline}" stroke-opacity="0.35" stroke-width="2"/>`
  );
}

/** Arm resting in front of the body, hand under the chin (thinking). */
function chinArm(id) {
  return `<path d="M186 170 Q178 188 154 182" stroke="url(#${id}-arm)" stroke-width="22" fill="none" stroke-linecap="round"/>
          <path d="M160 190 Q172 192 182 184" stroke="${C.outline}" stroke-opacity="0.35" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

// ---- eyes ------------------------------------------------------------------
function eyes(kind) {
  const L = 98;
  const R = 142;
  const y = 130;
  const open = (dx = 0, dy = 0, scale = 1) =>
    [L, R]
      .map(
        (x) => `
      <ellipse cx="${x}" cy="${y}" rx="${11 * scale}" ry="${13.5 * scale}" fill="${C.eye}"/>
      <circle cx="${x + dx - 3.5}" cy="${y + dy - 5}" r="${4.6 * scale}" fill="#fff"/>
      <circle cx="${x + dx + 4}" cy="${y + dy + 4}" r="${2 * scale}" fill="#fff" opacity="0.9"/>`,
      )
      .join('');
  const arcUp = [L, R]
    .map(
      (x) =>
        `<path d="M${x - 10} ${y + 3} Q${x} ${y - 10} ${x + 10} ${y + 3}" fill="none" stroke="${C.eye}" stroke-width="5" stroke-linecap="round"/>`,
    )
    .join('');
  const arcDown = [L, R]
    .map(
      (x) =>
        `<path d="M${x - 10} ${y - 1} Q${x} ${y + 9} ${x + 10} ${y - 1}" fill="none" stroke="${C.eye}" stroke-width="4.5" stroke-linecap="round"/>`,
    )
    .join('');
  switch (kind) {
    case 'happy':
      return arcUp;
    case 'sleep':
      return arcDown;
    case 'look-up':
      return [L, R]
        .map(
          (x) => `
      <ellipse cx="${x}" cy="${y}" rx="11" ry="13.5" fill="${C.eye}"/>
      <circle cx="${x + 2}" cy="${y - 7}" r="4.6" fill="#fff"/>
      <circle cx="${x - 4}" cy="${y + 2}" r="1.8" fill="#fff" opacity="0.9"/>`,
        )
        .join('');
    case 'wide':
      return open(0, 0, 1.15);
    case 'sparkle':
      return [L, R]
        .map(
          (x) => `
      <ellipse cx="${x}" cy="${y}" rx="12" ry="14" fill="${C.eye}"/>
      ${star(x - 2, y - 3, 6.5, '#fff')}
      <circle cx="${x + 5}" cy="${y + 6}" r="2" fill="#fff"/>`,
        )
        .join('');
    default:
      return open();
  }
}

// ---- brows (only for some emotions) ---------------------------------------
function brows(kind) {
  if (kind === 'soft')
    return `<path d="M88 108 Q97 104 106 107" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M134 107 Q143 104 152 108" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  if (kind === 'raised')
    return `<path d="M88 104 Q97 97 106 102" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M134 102 Q143 97 152 104" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  if (kind === 'think')
    return `<path d="M88 106 Q97 103 106 106" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M134 101 Q143 96 152 101" stroke="${C.eye}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  return '';
}

// ---- mouth -----------------------------------------------------------------
function mouth(kind) {
  const x = 120;
  const y = 154;
  switch (kind) {
    case 'open':
      return `<path d="M${x - 12} ${y - 2} Q${x} ${y + 1} ${x + 12} ${y - 2} Q${x} ${y + 18} ${x - 12} ${y - 2} Z" fill="${C.mouth}"/>
              <path d="M${x - 6} ${y + 7} Q${x} ${y + 3} ${x + 6} ${y + 7} Q${x} ${y + 11} ${x - 6} ${y + 7} Z" fill="${C.tongue}"/>`;
    case 'big':
      return `<path d="M${x - 16} ${y - 4} Q${x} ${y} ${x + 16} ${y - 4} Q${x} ${y + 24} ${x - 16} ${y - 4} Z" fill="${C.mouth}"/>
              <path d="M${x - 8} ${y + 9} Q${x} ${y + 4} ${x + 8} ${y + 9} Q${x} ${y + 15} ${x - 8} ${y + 9} Z" fill="${C.tongue}"/>`;
    case 'o':
      return `<ellipse cx="${x}" cy="${y + 4}" rx="7" ry="9" fill="${C.mouth}"/>`;
    case 'hmm':
      return `<path d="M${x - 7} ${y + 3} Q${x + 2} ${y} ${x + 9} ${y + 4}" stroke="${C.mouth}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'tiny':
      return `<path d="M${x - 5} ${y + 2} Q${x} ${y + 6} ${x + 5} ${y + 2}" stroke="${C.mouth}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default: // smile
      return `<path d="M${x - 10} ${y} Q${x} ${y + 11} ${x + 10} ${y}" stroke="${C.mouth}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
}

/** Emotion → facial features, arms and extras. */
export const EMOTIONS = {
  greeting: { label: 'Begrüßung', eyes: 'open', mouth: 'open', brows: '', left: 'down', right: 'wave', extra: 'wave' },
  happy: { label: 'Fröhlich', eyes: 'happy', mouth: 'big', brows: '', left: 'rest', right: 'rest', extra: '' },
  thinking: {
    label: 'Nachdenklich',
    eyes: 'look-up',
    mouth: 'hmm',
    brows: 'think',
    left: 'down',
    right: 'none',
    extra: 'think',
  },
  surprised: {
    label: 'Überrascht',
    eyes: 'wide',
    mouth: 'o',
    brows: 'raised',
    left: 'point',
    right: 'point',
    extra: '',
  },
  excited: {
    label: 'Begeistert',
    eyes: 'sparkle',
    mouth: 'big',
    brows: '',
    left: 'up',
    right: 'up',
    extra: 'sparkles',
  },
  success: { label: 'Geschafft!', eyes: 'happy', mouth: 'big', brows: '', left: 'up', right: 'up', extra: 'trophy' },
  encourage: {
    label: 'Ermutigung',
    eyes: 'open',
    mouth: 'smile',
    brows: 'soft',
    left: 'down',
    right: 'point',
    extra: 'heart',
  },
  sleeping: { label: 'Schläft', eyes: 'sleep', mouth: 'tiny', brows: '', left: 'rest', right: 'rest', extra: 'zzz' },
};

function extras(kind) {
  switch (kind) {
    case 'wave':
      return `<path d="M214 66 q6 4 4 12" stroke="${C.starDark}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.6"/>
              <path d="M224 60 q9 7 6 20" stroke="${C.starDark}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.4"/>`;
    case 'think':
      return `<circle cx="196" cy="70" r="5" fill="${C.star}" opacity="0.7"/><circle cx="208" cy="54" r="8" fill="${C.star}" opacity="0.7"/>
              <text x="208" y="60" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#fff">?</text>`;
    case 'sparkles':
      return (
        star(28, 70, 10, '#FFE18A', 10) +
        star(214, 58, 8, C.star, -8) +
        star(18, 112, 5, C.star) +
        star(226, 104, 6, '#FFE18A')
      );
    case 'trophy':
      return (
        star(120, 10, 14, '#FFE18A', 0) +
        star(40, 40, 8, C.star, 12) +
        star(200, 36, 9, '#FFE18A', -12) +
        star(22, 92, 5, '#FFBBAA') +
        star(222, 96, 6, C.star)
      );
    case 'heart':
      return `<path d="M214 92 c-6 -8 -18 -4 -14 6 c2 5 14 13 14 13 s12 -8 14 -13 c4 -10 -8 -14 -14 -6z" fill="#FFBBAA"/>`;
    case 'zzz':
      return `<text x="170" y="62" font-family="Nunito" font-weight="900" font-size="22" fill="${C.starDark}" opacity="0.75">z</text>
              <text x="188" y="44" font-family="Nunito" font-weight="900" font-size="28" fill="${C.starDark}" opacity="0.55">Z</text>`;
    default:
      return '';
  }
}

/**
 * @param {object} o
 * @param {keyof typeof EMOTIONS} [o.emotion]
 * @param {number} [o.size] rendered width in px
 * @param {string} [o.style] extra inline style
 */
export function mascot({ emotion = 'greeting', size = 200, style = '' } = {}) {
  const e = EMOTIONS[emotion];
  const id = `pino${++counter}`;
  const sleeping = emotion === 'sleeping';
  return `<svg class="mascot" role="img" aria-label="Pino – ${e.label}" width="${size}" height="${size}" viewBox="0 0 240 240" style="${style}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-body" x1="0.2" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${C.bodyLight}"/><stop offset="0.55" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyDark}"/>
    </linearGradient>
    <linearGradient id="${id}-arm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyDark}"/>
    </linearGradient>
    <radialGradient id="${id}-shine" cx="0.32" cy="0.28" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="120" cy="222" rx="70" ry="9" fill="#38334F" opacity="0.08"/>
  <g ${sleeping ? 'transform="rotate(-4 120 200)"' : ''}>
    <ellipse cx="92" cy="208" rx="21" ry="12" fill="${C.foot}"/>
    <ellipse cx="148" cy="208" rx="21" ry="12" fill="${C.foot}"/>
    ${arm('left', e.left, id)}
    ${e.right === 'none' ? '' : arm('right', e.right, id)}
    <path d="${BODY}" fill="url(#${id}-body)" stroke="${C.outline}" stroke-opacity="0.45" stroke-width="2.5"/>
    <path d="${BODY}" fill="url(#${id}-shine)"/>
    <path d="M70 186 Q120 200 170 186" stroke="#fff" stroke-opacity="0.35" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${star(142, 50, 11, C.star, 14)}
    <circle cx="139" cy="47" r="2.6" fill="#fff" opacity="0.8"/>
    ${brows(e.brows)}
    ${eyes(e.eyes)}
    <ellipse cx="78" cy="152" rx="11" ry="7" fill="${C.cheek}" opacity="0.55"/>
    <ellipse cx="162" cy="152" rx="11" ry="7" fill="${C.cheek}" opacity="0.55"/>
    ${mouth(e.mouth)}
    ${emotion === 'thinking' ? chinArm(id) : ''}
  </g>
  ${extras(e.extra)}
</svg>`;
}
