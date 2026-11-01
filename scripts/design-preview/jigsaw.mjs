// Minimal seeded jigsaw path generator used ONLY for the concept mockups.
//
// The production puzzle engine (packages/puzzle-engine, Phase 4) will be a
// fully tested TypeScript implementation; this prototype validates the core
// idea that both neighbours of an edge are built from the *same* curve
// (once forwards, once reversed) so shared edges match exactly.

/** mulberry32 – tiny deterministic PRNG. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tab template in edge-local coordinates: u ∈ [0,1] along the edge,
// v = outward displacement (fraction of edge length). Cubic segments.
const TAB = [
  [
    [0.0, 0],
    [0.32, 0.0],
    [0.42, 0.02],
    [0.4, 0.1],
  ],
  [
    [0.4, 0.1],
    [0.37, 0.2],
    [0.38, 0.27],
    [0.5, 0.27],
  ],
  [
    [0.5, 0.27],
    [0.62, 0.27],
    [0.63, 0.2],
    [0.6, 0.1],
  ],
  [
    [0.6, 0.1],
    [0.58, 0.02],
    [0.68, 0.0],
    [1.0, 0],
  ],
];

/** Builds an edge as a list of cubic segments in absolute coordinates. */
function edge(p0, p1, sign, jitter) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy);
  // normal (rotate +90°)
  const nx = -dy / len;
  const ny = dx / len;
  const map = ([u, v]) => {
    const uu = u === 0 || u === 1 ? u : u + jitter;
    return [p0[0] + dx * uu + nx * v * len * sign, p0[1] + dy * uu + ny * v * len * sign];
  };
  if (sign === 0) return [[p0, p0, p1, p1]];
  return TAB.map((seg) => seg.map(map));
}

const reverse = (segs) =>
  segs
    .slice()
    .reverse()
    .map(([a, b, c, d]) => [d, c, b, a]);
const fmt = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

/**
 * @returns {{ pieces: {row:number,col:number,d:string,x:number,y:number,w:number,h:number}[] }}
 */
export function jigsaw({ rows, cols, width, height, seed = 1 }) {
  const r = rng(seed);
  const pw = width / cols;
  const ph = height / rows;
  // horizontal internal edges (between row i and i+1), drawn left→right
  const hEdges = [];
  for (let i = 1; i < rows; i++) {
    hEdges[i] = [];
    for (let j = 0; j < cols; j++) {
      const sign = r() < 0.5 ? 1 : -1;
      hEdges[i][j] = edge([j * pw, i * ph], [(j + 1) * pw, i * ph], sign, (r() - 0.5) * 0.08);
    }
  }
  // vertical internal edges (between col j and j+1), drawn top→bottom
  const vEdges = [];
  for (let j = 1; j < cols; j++) {
    vEdges[j] = [];
    for (let i = 0; i < rows; i++) {
      const sign = r() < 0.5 ? 1 : -1;
      vEdges[j][i] = edge([j * pw, i * ph], [j * pw, (i + 1) * ph], sign, (r() - 0.5) * 0.08);
    }
  }
  const pieces = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x0 = j * pw;
      const y0 = i * ph;
      const x1 = x0 + pw;
      const y1 = y0 + ph;
      const top = i === 0 ? edge([x0, y0], [x1, y0], 0) : hEdges[i][j];
      const right = j === cols - 1 ? edge([x1, y0], [x1, y1], 0) : vEdges[j + 1][i];
      const bottom = i === rows - 1 ? edge([x1, y1], [x0, y1], 0) : reverse(hEdges[i + 1][j]);
      const left = j === 0 ? edge([x0, y1], [x0, y0], 0) : reverse(vEdges[j][i]);
      const segs = [...top, ...right, ...bottom, ...left];
      const d =
        `M${fmt(segs[0][0])} ` + segs.map(([, c1, c2, p]) => `C${fmt(c1)} ${fmt(c2)} ${fmt(p)}`).join(' ') + 'Z';
      pieces.push({ row: i, col: j, d, x: x0, y: y0, w: pw, h: ph });
    }
  }
  return { pieces };
}
