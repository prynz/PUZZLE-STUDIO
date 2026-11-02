/** Pino's hint: which piece to suggest next (docs/product/gameplay-concept.md §5). */
import type { PuzzleState } from './state.ts';
import type { PieceShape, Puzzle } from './types.ts';

function neighbours(puzzle: Puzzle, p: PieceShape): number[] {
  const { rows, cols } = puzzle.definition;
  const out: number[] = [];
  if (p.row > 0) out.push(p.id - cols);
  if (p.row < rows - 1) out.push(p.id + cols);
  if (p.col > 0) out.push(p.id - 1);
  if (p.col < cols - 1) out.push(p.id + 1);
  return out;
}

const KIND_RANK = { corner: 2, edge: 1, inner: 0 } as const;

/**
 * Suggests one piece that is not placed yet. Preference:
 * 1. most locked neighbours (the child can see where it goes),
 * 2. frame first (corners, then edges) – "erst den Rahmen",
 * 3. the piece the child can see first: loose pieces on top, then tray order.
 * `among` limits the choice (active bite, selected basket). Returns null if nothing is left.
 */
export function suggestPiece(puzzle: Puzzle, state: PuzzleState, among?: readonly number[]): number | null {
  const allowed = among ? new Set(among) : null;
  const visibility = new Map<number, number>();
  [...state.z].reverse().forEach((id, i) => visibility.set(id, i));
  state.trayOrder.forEach((id, i) => visibility.set(id, state.z.length + i));

  let best: number | null = null;
  let bestKey: [number, number, number] = [-1, -1, Infinity];
  for (const p of puzzle.pieces) {
    const rt = state.pieces[p.id];
    if (!rt || rt.state === 'locked' || (allowed && !allowed.has(p.id))) continue;
    const lockedAround = neighbours(puzzle, p).filter((n) => state.pieces[n]?.state === 'locked').length;
    const key: [number, number, number] = [lockedAround, KIND_RANK[p.kind], visibility.get(p.id) ?? Infinity];
    const better =
      key[0] > bestKey[0] ||
      (key[0] === bestKey[0] && (key[1] > bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])));
    if (better) {
      best = p.id;
      bestKey = key;
    }
  }
  return best;
}
