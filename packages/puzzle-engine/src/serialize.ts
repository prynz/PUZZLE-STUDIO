/**
 * Saving and restoring (docs/puzzle-engine/serialization.md). Only the changeable state is
 * stored; geometry is regenerated from the definition. Positions are stored relative to the
 * board size → independent of device and image resolution.
 * Loading never throws: invalid data yields { ok: false } and the app starts the puzzle fresh.
 */
import { MAX_CUSTOM_BASKETS } from './assist.ts';
import { pieceAt } from './puzzle.ts';
import { MAX_BASKET_LABEL, type BasketPref, type PieceRuntime, type PuzzleState } from './state.ts';
import type { Puzzle } from './types.ts';

export const STATE_VERSION = 1;

export interface PuzzleStateV1 {
  v: 1;
  pieces: { id: number; x: number; y: number; state: 'tray' | 'loose' | 'locked'; basket?: string }[];
  z: number[];
  trayOrder: number[];
  baskets: BasketPref[];
  misplaceMode: 'nudge' | 'return';
  moves: number;
  referenceVisible: boolean;
}

export function serializeState(puzzle: Puzzle, state: PuzzleState): string {
  const { width, height } = puzzle.definition;
  const doc: PuzzleStateV1 = {
    v: 1,
    pieces: state.pieces.map((p, id) => ({
      id,
      x: p.x / width,
      y: p.y / height,
      state: p.state,
      ...(p.basket !== undefined ? { basket: p.basket } : {}),
    })),
    z: state.z,
    trayOrder: state.trayOrder,
    baskets: state.baskets,
    misplaceMode: state.misplaceMode,
    moves: state.moves,
    referenceVisible: state.referenceVisible,
  };
  return JSON.stringify(doc);
}

export type ParseResult = { ok: true; state: PuzzleState } | { ok: false; reason: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
/** Loose pieces may lie next to the board, but not absurdly far away. */
const POS_LIMIT = 10;

/**
 * Brings older documents to the current version. Only v1 exists so far; unknown or future
 * versions are rejected (the app then starts fresh instead of guessing).
 */
export function migrateState(raw: unknown): { ok: true; doc: Record<string, unknown> } | { ok: false; reason: string } {
  if (!isObj(raw)) return { ok: false, reason: 'not an object' };
  if (raw.v === STATE_VERSION) return { ok: true, doc: raw };
  return { ok: false, reason: `unsupported state version ${String(raw.v)}` };
}

function isPermutationOf(list: unknown, expected: ReadonlySet<number>): list is number[] {
  if (!Array.isArray(list) || list.length !== expected.size) return false;
  const seen = new Set<number>();
  for (const id of list) {
    if (!isInt(id) || !expected.has(id) || seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}

function parseBaskets(raw: unknown): BasketPref[] | null {
  if (!Array.isArray(raw)) return null;
  const out: BasketPref[] = [];
  const ids = new Set<string>();
  for (const b of raw) {
    if (!isObj(b) || typeof b.id !== 'string' || !b.id || ids.has(b.id) || !isInt(b.order)) return null;
    if (b.label !== undefined && (typeof b.label !== 'string' || b.label.length > MAX_BASKET_LABEL)) return null;
    if (b.custom !== undefined && b.custom !== true) return null;
    ids.add(b.id);
    out.push({
      id: b.id,
      order: b.order,
      ...(typeof b.label === 'string' ? { label: b.label } : {}),
      ...(b.custom === true ? { custom: true as const } : {}),
    });
  }
  return out.filter((b) => b.custom).length <= MAX_CUSTOM_BASKETS ? out : null;
}

export function parseState(puzzle: Puzzle, json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'invalid JSON' };
  }
  const migrated = migrateState(raw);
  if (!migrated.ok) return migrated;
  const d = migrated.doc;
  const n = puzzle.pieces.length;
  const { width, height } = puzzle.definition;

  if (!Array.isArray(d.pieces) || d.pieces.length !== n) return { ok: false, reason: 'piece count mismatch' };
  const baskets = parseBaskets(d.baskets);
  if (!baskets) return { ok: false, reason: 'invalid baskets' };
  const customIds = new Set(baskets.filter((b) => b.custom).map((b) => b.id));

  const pieces: (PieceRuntime | undefined)[] = new Array<PieceRuntime | undefined>(n);
  for (const p of d.pieces as unknown[]) {
    if (!isObj(p) || !isInt(p.id) || p.id < 0 || p.id >= n || pieces[p.id])
      return { ok: false, reason: 'bad piece id' };
    if (p.state !== 'tray' && p.state !== 'loose' && p.state !== 'locked') return { ok: false, reason: 'bad state' };
    if (!isNum(p.x) || !isNum(p.y) || Math.abs(p.x) > POS_LIMIT || Math.abs(p.y) > POS_LIMIT)
      return { ok: false, reason: 'bad position' };
    if (p.basket !== undefined && (typeof p.basket !== 'string' || !customIds.has(p.basket)))
      return { ok: false, reason: 'bad basket' };
    // locked is final: the stored position is ignored, the piece sits exactly in its cell
    const { cell } = pieceAt(puzzle, p.id);
    const rt: PieceRuntime =
      p.state === 'locked'
        ? { state: 'locked', x: cell.x, y: cell.y }
        : { state: p.state, x: p.x * width, y: p.y * height };
    if (p.state !== 'locked' && typeof p.basket === 'string') rt.basket = p.basket;
    pieces[p.id] = rt;
  }
  const all = pieces as PieceRuntime[]; // every slot filled: n distinct ids in 0..n-1 were checked above

  const ofState = (s: PieceRuntime['state']) => new Set(all.flatMap((p, id) => (p.state === s ? [id] : [])));
  if (!isPermutationOf(d.z, ofState('loose'))) return { ok: false, reason: 'z order mismatch' };
  if (!isPermutationOf(d.trayOrder, ofState('tray'))) return { ok: false, reason: 'tray order mismatch' };
  if (d.misplaceMode !== 'nudge' && d.misplaceMode !== 'return') return { ok: false, reason: 'bad misplace mode' };
  if (!isInt(d.moves) || d.moves < 0) return { ok: false, reason: 'bad moves' };
  if (typeof d.referenceVisible !== 'boolean') return { ok: false, reason: 'bad reference flag' };

  return {
    ok: true,
    state: {
      pieces: all,
      z: d.z,
      trayOrder: d.trayOrder,
      baskets,
      misplaceMode: d.misplaceMode,
      moves: d.moves,
      referenceVisible: d.referenceVisible,
    },
  };
}
