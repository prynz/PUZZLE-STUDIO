import { TAB_MAX_EXTENT, edgeCommands, edgeExtentPoints, reversed, straightEdge, tabEdge, type Edge } from './edges.ts';
import { isValidGrid } from './grid.ts';
import { createRandom } from './random.ts';
import {
  ENGINE_VERSION,
  type EdgeSign,
  type PathCommand,
  type PieceKind,
  type PieceShape,
  type Point,
  type Puzzle,
  type PuzzleDefinition,
  type Rect,
} from './types.ts';

function at<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) throw new RangeError(`index ${i} out of range`);
  return v;
}

function kindOf(row: number, col: number, rows: number, cols: number): PieceKind {
  const v = row === 0 || row === rows - 1;
  const h = col === 0 || col === cols - 1;
  return v && h ? 'corner' : v || h ? 'edge' : 'inner';
}

function boundsOf(points: readonly Point[]): Rect {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of points) {
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x);
    y1 = Math.max(y1, p.y);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

const signOf = (e: Edge, outward: number): EdgeSign => (e.cubics ? (outward > 0 ? 1 : -1) : 0);

/**
 * Generates all piece shapes for a definition. Pure and deterministic:
 * the same definition always yields bit-identical geometry.
 */
export function generatePuzzle(def: PuzzleDefinition): Puzzle {
  if (def.engineVersion !== ENGINE_VERSION) throw new RangeError(`unsupported engine version ${def.engineVersion}`);
  if (!isValidGrid(def)) throw new RangeError('rows and cols must be integers between 2 and 16');
  if (!(def.width > 0) || !(def.height > 0)) throw new RangeError('width and height must be positive');

  const { rows, cols, width, height } = def;
  const pw = width / cols;
  const ph = height / rows;
  const base = Math.min(pw, ph);
  // One expression for every grid corner → neighbours share bit-identical corner points.
  const corner = (i: number, j: number): Point => ({ x: (j * width) / cols, y: (i * height) / rows });
  const rnd = createRandom(def.seed);
  const classic = def.shape === 'classic';
  // Each inner edge: [sign, shift, size] – the draw order is part of the engine version.
  const vary = () => ({
    sign: (rnd() < 0.5 ? 1 : -1) as EdgeSign,
    shift: (rnd() - 0.5) * 0.08,
    size: 0.92 + rnd() * 0.18,
  });

  // h[i][j]: edge between row i-1 and row i, left → right; +1 bulges down.
  const h: Edge[][] = [];
  for (let i = 0; i <= rows; i++) {
    const row: Edge[] = [];
    for (let j = 0; j < cols; j++) {
      const a = corner(i, j);
      const b = corner(i, j + 1);
      const inner = classic && i > 0 && i < rows;
      row.push(inner ? tabEdge(a, b, { dir: { x: 0, y: 1 }, base, ...vary() }) : straightEdge(a, b));
    }
    h.push(row);
  }
  // v[j][i]: edge between col j-1 and col j, top → bottom; +1 bulges right.
  const v: Edge[][] = [];
  for (let j = 0; j <= cols; j++) {
    const col: Edge[] = [];
    for (let i = 0; i < rows; i++) {
      const a = corner(i, j);
      const b = corner(i + 1, j);
      const inner = classic && j > 0 && j < cols;
      col.push(inner ? tabEdge(a, b, { dir: { x: 1, y: 0 }, base, ...vary() }) : straightEdge(a, b));
    }
    v.push(col);
  }

  // Which way each shared edge bulges is recorded while generating: compare control point vs. corner.
  const bulge = (e: Edge, axis: 'x' | 'y'): number => {
    if (!e.cubics) return 0;
    const peak = at(e.cubics, 1)[3]; // tab top
    return peak[axis] - e.from[axis];
  };

  const pieces: PieceShape[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const top = at(at(h, i), j);
      const right = at(at(v, j + 1), i);
      const bottom = at(at(h, i + 1), j);
      const left = at(at(v, j), i);
      const ring = [top, right, reversed(bottom), reversed(left)];

      const start = top.from;
      const path: PathCommand[] = [{ op: 'M', x: start.x, y: start.y }];
      const outline: number[] = [];
      for (const e of ring) {
        path.push(...edgeCommands(e));
        // drop each edge's first point (= previous edge's last point)
        for (let k = 1; k < e.points.length; k++) {
          const p = at(e.points, k);
          outline.push(p.x, p.y);
        }
      }
      path.push({ op: 'Z' });

      const cell: Rect = { x: corner(i, j).x, y: corner(i, j).y, w: pw, h: ph };
      pieces.push({
        id: i * cols + j,
        row: i,
        col: j,
        cell,
        bounds: boundsOf(ring.flatMap(edgeExtentPoints)),
        edges: {
          top: signOf(top, -bulge(top, 'y')),
          right: signOf(right, bulge(right, 'x')),
          bottom: signOf(bottom, bulge(bottom, 'y')),
          left: signOf(left, -bulge(left, 'x')),
        },
        kind: kindOf(i, j, rows, cols),
        path,
        outline,
      });
    }
  }
  return { definition: def, pieceWidth: pw, pieceHeight: ph, pieces };
}

/** Maximum distance a tab reaches beyond its cell (image space). */
export function tabReach(puzzle: Puzzle): number {
  return puzzle.definition.shape === 'classic' ? TAB_MAX_EXTENT * Math.min(puzzle.pieceWidth, puzzle.pieceHeight) : 0;
}

export function pieceAt(puzzle: Puzzle, id: number): PieceShape {
  return at(puzzle.pieces, id);
}

/** SVG path string (Skia: `Skia.Path.MakeFromSVGString`). Offset moves the piece from its home cell. */
export function toSvgPath(path: readonly PathCommand[], dx = 0, dy = 0): string {
  const n = (v: number) => String(Math.round(v * 100) / 100);
  return path
    .map((c) => {
      switch (c.op) {
        case 'M':
        case 'L':
          return `${c.op}${n(c.x + dx)} ${n(c.y + dy)}`;
        case 'C':
          return `C${n(c.x1 + dx)} ${n(c.y1 + dy)} ${n(c.x2 + dx)} ${n(c.y2 + dy)} ${n(c.x + dx)} ${n(c.y + dy)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

/** Scale + offset that fits the image-space board into `area` (letterboxed, centred). */
export function fitBoard(puzzle: Puzzle, area: Rect): { scale: number; x: number; y: number } {
  const { width, height } = puzzle.definition;
  const scale = Math.min(area.w / width, area.h / height);
  return { scale, x: area.x + (area.w - width * scale) / 2, y: area.y + (area.h - height * scale) / 2 };
}
