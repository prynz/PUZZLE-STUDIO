/** Grid sizing (docs/puzzle-engine/geometry.md §Grid-Berechnung). */

export const MIN_GRID = 2;
export const MAX_GRID = 16;

/** Piece counts offered when creating a puzzle. The actual count can differ slightly (aspect ratio). */
export const PIECE_PRESETS = [4, 9, 16, 25, 36, 49, 64, 100, 144, 196, 256] as const;

export interface GridSize {
  rows: number;
  cols: number;
}

/** Weight of "piece count differs from the wish" vs. "pieces are not square". */
const COUNT_WEIGHT = 4;

/**
 * Best rows × cols for roughly `target` pieces on an image with aspect `w / h`.
 * Scores every candidate by relative count deviation and by how far the piece aspect
 * is from square (log scale, so 2:1 and 1:2 weigh the same).
 */
export function chooseGrid(target: number, aspect: number): GridSize {
  if (!(target > 0) || !(aspect > 0)) throw new RangeError('target and aspect must be positive');
  let best: GridSize = { rows: MIN_GRID, cols: MIN_GRID };
  let bestScore = Number.POSITIVE_INFINITY;
  for (let rows = MIN_GRID; rows <= MAX_GRID; rows++) {
    for (let cols = MIN_GRID; cols <= MAX_GRID; cols++) {
      const count = rows * cols;
      const pieceAspect = (aspect * rows) / cols;
      const score = (COUNT_WEIGHT * Math.abs(count - target)) / target + Math.abs(Math.log(pieceAspect));
      // strict "<" keeps the first (smallest rows, then cols) candidate on ties → deterministic
      if (score < bestScore - 1e-12) {
        bestScore = score;
        best = { rows, cols };
      }
    }
  }
  return best;
}

/** Validates a manual grid (2…16 per side). */
export function isValidGrid({ rows, cols }: GridSize): boolean {
  const ok = (n: number) => Number.isInteger(n) && n >= MIN_GRID && n <= MAX_GRID;
  return ok(rows) && ok(cols);
}
