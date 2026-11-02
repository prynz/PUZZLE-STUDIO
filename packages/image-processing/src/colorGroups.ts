/**
 * Groups puzzle pieces by color for the sorting baskets
 * (docs/product/gameplay-concept.md §4). Pure and deterministic:
 * the same input always yields the same groups, order and names.
 *
 * Input: one average color per piece (sampled from the WORK version) and the
 * piece's vertical position (0 = top, 1 = bottom) for name suggestions.
 */

export type Rgb = readonly [number, number, number];

export interface PieceColor {
  rgb: Rgb;
  /** Normalized vertical center of the piece in the picture (0 top … 1 bottom). */
  y: number;
}

export interface ColorGroup {
  /** Stable id (index after sorting by size). */
  id: number;
  /** Representative color as #RRGGBB. */
  color: string;
  /** Suggested basket name – user/kid may rename (profile kid/pro). */
  name: string;
  /** Piece indices belonging to this group. */
  members: number[];
}

const dist2 = (a: Rgb, b: Rgb) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const mean = (cs: readonly Rgb[]): Rgb => {
  const n = Math.max(1, cs.length);
  const s = cs.reduce<[number, number, number]>((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
  return [s[0] / n, s[1] / n, s[2] / n];
};
const toHex = (c: Rgb) =>
  '#' +
  c
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase();

/** RGB → HSL (h in degrees, s/l in 0..1). */
export function rgbToHsl([r0, g0, b0]: Rgb): { h: number; s: number; l: number } {
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

/** German color name for a basket (child friendly, coarse). */
export function colorName(rgb: Rgb): string {
  const { h, s, l } = rgbToHsl(rgb);
  if (l > 0.9) return 'Weiß';
  if (l < 0.15) return 'Schwarz';
  if (s < 0.15) return 'Grau';
  if (h < 15 || h >= 345) return l > 0.7 ? 'Rosa' : 'Rot';
  if (h < 40) return l < 0.45 ? 'Braun' : 'Orange';
  if (h < 65) return 'Gelb';
  if (h < 160) return 'Grün';
  if (h < 200) return 'Türkis';
  if (h < 255) return 'Blau';
  if (h < 290) return 'Lila';
  return 'Rosa';
}

/**
 * Speaking name only when it is unambiguous (PO decision): blue-ish pieces
 * mostly in the upper part → "Himmel", green-ish mostly in the lower part →
 * "Wiese". Otherwise the plain color name.
 */
export function suggestName(rgb: Rgb, avgY: number): string {
  const name = colorName(rgb);
  if ((name === 'Blau' || name === 'Türkis') && avgY < 0.4) return 'Himmel';
  if (name === 'Grün' && avgY > 0.55) return 'Wiese';
  return name;
}

/**
 * Deterministic k-means with farthest-point initialization.
 * `k` defaults to 3–5 depending on the number of pieces.
 */
export function pieceColorGroups(pieces: readonly PieceColor[], k?: number): ColorGroup[] {
  if (pieces.length === 0) return [];
  const colors = pieces.map((p) => p.rgb);
  const kk = Math.max(1, Math.min(k ?? (pieces.length < 25 ? 3 : pieces.length < 100 ? 4 : 5), pieces.length));

  // init: start with the color closest to the global mean, then farthest points
  const m = mean(colors);
  let first = 0;
  colors.forEach((c, i) => {
    if (dist2(c, m) < dist2(colors[first] ?? m, m)) first = i;
  });
  const centers: Rgb[] = [colors[first] ?? m];
  while (centers.length < kk) {
    let best = 0;
    let bestD = -1;
    colors.forEach((c, i) => {
      const d = Math.min(...centers.map((ct) => dist2(c, ct)));
      if (d > bestD) {
        bestD = d;
        best = i;
      }
    });
    centers.push(colors[best] ?? m);
  }

  let assign = new Array<number>(colors.length).fill(0);
  for (let iter = 0; iter < 25; iter++) {
    const next = colors.map((c) => {
      let bi = 0;
      centers.forEach((ct, i) => {
        if (dist2(c, ct) < dist2(c, centers[bi] ?? ct)) bi = i;
      });
      return bi;
    });
    const changed = next.some((v, i) => v !== assign[i]);
    assign = next;
    centers.forEach((_, ci) => {
      const members = colors.filter((__, i) => assign[i] === ci);
      if (members.length > 0) centers[ci] = mean(members);
    });
    if (!changed && iter > 0) break;
  }

  const groups = centers
    .map((ct, ci) => {
      const members = assign.flatMap((a, i) => (a === ci ? [i] : []));
      const avgY = members.reduce((s, i) => s + (pieces[i]?.y ?? 0), 0) / Math.max(1, members.length);
      return { ct, members, avgY };
    })
    .filter((g) => g.members.length > 0)
    // largest first; ties broken by top-most, then by color → stable order
    .sort((a, b) => b.members.length - a.members.length || a.avgY - b.avgY || toHex(a.ct).localeCompare(toHex(b.ct)));

  // make duplicate names unique ("Blau", "Blau 2")
  const seen = new Map<string, number>();
  return groups.map((g, id) => {
    const base = suggestName(g.ct, g.avgY);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { id, color: toHex(g.ct), name: n === 1 ? base : `${base} ${n}`, members: g.members };
  });
}
