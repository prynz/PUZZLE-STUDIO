/**
 * Runtime puzzle state and the moves a child can make. Pure: every operation returns a
 * new state. Positions are the top-left of a piece's cell in image space.
 */
import { MAX_CUSTOM_BASKETS, type MisplaceMode } from './assist.ts';
import { pieceAt } from './puzzle.ts';
import { shuffled } from './random.ts';
import type { Point, Puzzle, Rect } from './types.ts';

export type PieceState = 'tray' | 'loose' | 'locked';

export interface PieceRuntime {
  state: PieceState;
  x: number;
  y: number;
  /** Custom basket ("Meine Schale") the child put the piece in. */
  basket?: string;
}

/** Child's basket preferences: renamed label, own order, custom baskets. */
export interface BasketPref {
  id: string;
  label?: string;
  order: number;
  custom?: true;
}

export interface PuzzleState {
  /** index = piece id */
  pieces: PieceRuntime[];
  /** Stacking order of loose pieces (last = top). */
  z: number[];
  /** Order of the pieces in the tray. */
  trayOrder: number[];
  baskets: BasketPref[];
  misplaceMode: MisplaceMode;
  moves: number;
  referenceVisible: boolean;
}

export interface CreateStateOptions {
  seed: number;
  misplaceMode: MisplaceMode;
  referenceVisible?: boolean;
}

/** All pieces start in the tray, in a seeded random order (fun, but reproducible). */
export function createState(puzzle: Puzzle, opts: CreateStateOptions): PuzzleState {
  return {
    pieces: puzzle.pieces.map((p) => ({ state: 'tray', x: p.cell.x, y: p.cell.y })),
    z: [],
    trayOrder: shuffled(
      puzzle.pieces.map((p) => p.id),
      opts.seed,
    ),
    baskets: [],
    misplaceMode: opts.misplaceMode,
    moves: 0,
    referenceVisible: opts.referenceVisible ?? true,
  };
}

function piece(state: PuzzleState, id: number): PieceRuntime {
  const p = state.pieces[id];
  if (!p) throw new RangeError(`unknown piece ${id}`);
  return p;
}

function withPiece(state: PuzzleState, id: number, next: PieceRuntime): PieceRuntime[] {
  const pieces = state.pieces.slice();
  pieces[id] = next;
  return pieces;
}

export const lockedCount = (state: PuzzleState) => state.pieces.filter((p) => p.state === 'locked').length;
export const isComplete = (state: PuzzleState) => state.pieces.every((p) => p.state === 'locked');
export const loosePieces = (state: PuzzleState) => state.z.slice();

/** Picks a piece up (from tray or board) and puts it on top at (x, y). Locked pieces never move. */
export function placeLoose(state: PuzzleState, id: number, x: number, y: number): PuzzleState {
  const p = piece(state, id);
  if (p.state === 'locked') return state;
  return {
    ...state,
    pieces: withPiece(state, id, { ...p, state: 'loose', x, y }),
    z: [...state.z.filter((k) => k !== id), id],
    trayOrder: state.trayOrder.filter((k) => k !== id),
  };
}

/** Back to the tray (shown first, so the child finds it again). */
export function returnToTray(state: PuzzleState, id: number): PuzzleState {
  const p = piece(state, id);
  if (p.state === 'locked') return state;
  return {
    ...state,
    pieces: withPiece(state, id, { ...p, state: 'tray' }),
    z: state.z.filter((k) => k !== id),
    trayOrder: [id, ...state.trayOrder.filter((k) => k !== id)],
  };
}

/** Distance between a position and the piece's home cell. */
export function distanceToTarget(puzzle: Puzzle, id: number, x: number, y: number): number {
  const { cell } = pieceAt(puzzle, id);
  return Math.hypot(x - cell.x, y - cell.y);
}

/** Within the snap radius? `tolerance` is a fraction of the smaller piece side (see assistFor). */
export function isNearTarget(puzzle: Puzzle, id: number, x: number, y: number, tolerance: number): boolean {
  return distanceToTarget(puzzle, id, x, y) <= tolerance * Math.min(puzzle.pieceWidth, puzzle.pieceHeight);
}

const overlaps = (a: Rect, b: Rect, gap: number) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

export interface FreeSpotOptions {
  /** The whole play area (board + surroundings) in image space. */
  area: Rect;
  /** Spots this close to the piece's own target are skipped (it would look placed but isn't). */
  tolerance: number;
  /** Rings to search (step = ¼ of the smaller piece side). Default 24 ≈ 6 piece widths. */
  maxRings?: number;
}

/**
 * Nearest free spot for a misplaced piece ("liegen lassen + ausweichen", PO decision):
 * no overlap with locked or other loose pieces, inside the play area. Searches square
 * rings around the drop point; within a ring the closest candidate wins (deterministic).
 * Returns null if nothing is free – the caller then returns the piece to the tray.
 */
export function findFreeSpot(
  puzzle: Puzzle,
  state: PuzzleState,
  id: number,
  x: number,
  y: number,
  opts: FreeSpotOptions,
): Point | null {
  const pw = puzzle.pieceWidth;
  const ph = puzzle.pieceHeight;
  const step = Math.min(pw, ph) / 4;
  const gap = step / 2;
  const occupied: Rect[] = [];
  state.pieces.forEach((p, k) => {
    if (k === id || p.state === 'tray') return;
    occupied.push({ x: p.x, y: p.y, w: pw, h: ph });
  });
  const { area } = opts;
  const fits = (cx: number, cy: number) =>
    cx >= area.x &&
    cy >= area.y &&
    cx + pw <= area.x + area.w &&
    cy + ph <= area.y + area.h &&
    !isNearTarget(puzzle, id, cx, cy, opts.tolerance) &&
    !occupied.some((o) => overlaps({ x: cx, y: cy, w: pw, h: ph }, o, gap));

  if (fits(x, y)) return { x, y };
  const maxRings = opts.maxRings ?? 24;
  for (let k = 1; k <= maxRings; k++) {
    let best: Point | null = null;
    let bestD = Infinity;
    for (let dy = -k; dy <= k; dy++) {
      for (let dx = -k; dx <= k; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue;
        const cx = x + dx * step;
        const cy = y + dy * step;
        const d = dx * dx + dy * dy;
        if (d < bestD && fits(cx, cy)) {
          bestD = d;
          best = { x: cx, y: cy };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

export type DropOutcome = 'locked' | 'stayed' | 'nudged' | 'returned';

export interface DropResult {
  state: PuzzleState;
  outcome: DropOutcome;
  /** Where the piece ends up (cell position for locked; unchanged for returned). */
  x: number;
  y: number;
}

export interface DropOptions {
  tolerance: number;
  area: Rect;
}

/**
 * Child lets go of a piece at (x, y).
 * Near its target → snaps in and is LOCKED for good (PO requirement).
 * Otherwise per misplace mode: glide to a free spot nearby, or back to the tray.
 */
export function dropPiece(
  puzzle: Puzzle,
  state: PuzzleState,
  id: number,
  x: number,
  y: number,
  opts: DropOptions,
): DropResult {
  const p = piece(state, id);
  if (p.state === 'locked') return { state, outcome: 'locked', x: p.x, y: p.y };
  const counted = { ...state, moves: state.moves + 1 };

  if (isNearTarget(puzzle, id, x, y, opts.tolerance)) {
    const { cell } = pieceAt(puzzle, id);
    const { basket: _drop, ...rest } = p; // a locked piece leaves its basket
    return {
      state: {
        ...counted,
        pieces: withPiece(counted, id, { ...rest, state: 'locked', x: cell.x, y: cell.y }),
        z: counted.z.filter((k) => k !== id),
        trayOrder: counted.trayOrder.filter((k) => k !== id),
      },
      outcome: 'locked',
      x: cell.x,
      y: cell.y,
    };
  }

  if (state.misplaceMode === 'nudge') {
    const spot = findFreeSpot(puzzle, state, id, x, y, opts);
    if (spot) {
      return {
        state: placeLoose(counted, id, spot.x, spot.y),
        outcome: spot.x === x && spot.y === y ? 'stayed' : 'nudged',
        x: spot.x,
        y: spot.y,
      };
    }
  }
  return { state: returnToTray(counted, id), outcome: 'returned', x: p.x, y: p.y };
}

export function setMisplaceMode(state: PuzzleState, misplaceMode: MisplaceMode): PuzzleState {
  return { ...state, misplaceMode };
}

export function setReferenceVisible(state: PuzzleState, referenceVisible: boolean): PuzzleState {
  return { ...state, referenceVisible };
}

// ---- Baskets ("Schalen") – names and order chosen by the child ------------------------------

export const MAX_BASKET_LABEL = 24;

const cleanLabel = (label: string) => label.trim().slice(0, MAX_BASKET_LABEL);

/** Rename a basket (auto or custom). An empty label restores the suggested name. */
export function renameBasket(state: PuzzleState, id: string, label: string): PuzzleState {
  const clean = cleanLabel(label);
  const existing = state.baskets.find((b) => b.id === id);
  const base: BasketPref = existing ?? { id, order: state.baskets.length };
  const { label: _old, ...rest } = base;
  const next: BasketPref = clean ? { ...rest, label: clean } : rest;
  return {
    ...state,
    baskets: existing ? state.baskets.map((b) => (b.id === id ? next : b)) : [...state.baskets, next],
  };
}

/** New order of baskets (ids in display order). Unknown ids get a preference entry. */
export function orderBaskets(state: PuzzleState, ids: readonly string[]): PuzzleState {
  const byId = new Map(state.baskets.map((b) => [b.id, b]));
  const ordered = ids.map((id, order) => ({ ...(byId.get(id) ?? { id }), order }));
  const rest = state.baskets.filter((b) => !ids.includes(b.id)).map((b, i) => ({ ...b, order: ids.length + i }));
  return { ...state, baskets: [...ordered, ...rest] };
}

/** Adds a "Meine Schale" basket – at most three per puzzle. Returns null when the limit is reached. */
export function addCustomBasket(state: PuzzleState, label: string): { state: PuzzleState; id: string } | null {
  const custom = state.baskets.filter((b) => b.custom);
  if (custom.length >= MAX_CUSTOM_BASKETS) return null;
  let n = 1;
  while (state.baskets.some((b) => b.id === `mine-${n}`)) n++;
  const id = `mine-${n}`;
  const clean = cleanLabel(label);
  const pref: BasketPref = clean
    ? { id, label: clean, order: state.baskets.length, custom: true }
    : { id, order: state.baskets.length, custom: true };
  return { state: { ...state, baskets: [...state.baskets, pref] }, id };
}

/** Removes a custom basket; its pieces go back to the general tray. */
export function removeCustomBasket(state: PuzzleState, id: string): PuzzleState {
  if (!state.baskets.some((b) => b.id === id && b.custom)) return state;
  return {
    ...state,
    baskets: state.baskets.filter((b) => b.id !== id),
    pieces: state.pieces.map((p) => {
      if (p.basket !== id) return p;
      const { basket: _b, ...rest } = p;
      return rest;
    }),
  };
}

/** Put a piece into a custom basket (or take it out with null). Locked pieces are ignored. */
export function putInBasket(state: PuzzleState, pieceId: number, basketId: string | null): PuzzleState {
  const p = piece(state, pieceId);
  if (p.state === 'locked') return state;
  if (basketId === null) {
    const { basket: _b, ...rest } = p;
    return { ...state, pieces: withPiece(state, pieceId, rest) };
  }
  if (!state.baskets.some((b) => b.id === basketId && b.custom)) throw new RangeError(`no custom basket ${basketId}`);
  return { ...state, pieces: withPiece(state, pieceId, { ...p, basket: basketId }) };
}
