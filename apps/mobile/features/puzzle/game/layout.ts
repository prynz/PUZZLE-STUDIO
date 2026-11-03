import type { AssistProfile, AssistRules, Rect } from '@puzzle-studio/puzzle-engine';

/** Screen layout of the play canvas: board area on top, tray strip below. */
export interface PlayLayout {
  width: number;
  height: number;
  board: Rect;
  tray: Rect;
  slot: number;
  gap: number;
  cols: number;
  rows: number;
  /** Pieces per tray page. */
  perPage: number;
}

const PAD = 12;
const GAP = 10;

/**
 * Tray slots: toddlers get very big pieces (≥ 96 dp, max. 4), the others ≥ 64 dp.
 * Small puzzles also use one tray row – phones are too narrow to lay pieces around the board.
 */
export function playLayout(width: number, height: number, profile: AssistProfile, rules: AssistRules): PlayLayout {
  const rows = Math.max(1, rules.trayRows);
  const inner = width - PAD * 2;
  let slot: number;
  let cols: number;
  if (profile === 'toddler') {
    const max = rules.trayMaxVisible ?? 4;
    slot = Math.max(96, Math.min(132, (inner - GAP * (max - 1)) / max));
    cols = Math.max(1, Math.min(max, Math.floor((inner + GAP) / (slot + GAP))));
  } else {
    slot = Math.max(64, Math.min(96, (inner - GAP * 4) / 5));
    cols = Math.max(1, Math.floor((inner + GAP) / (slot + GAP)));
  }
  const trayH = rows * slot + (rows - 1) * GAP + PAD * 2;
  const boardH = Math.max(80, height - trayH - PAD);
  return {
    width,
    height,
    board: { x: PAD, y: PAD, w: inner, h: boardH - PAD },
    tray: { x: 0, y: boardH, w: width, h: trayH },
    slot,
    gap: GAP,
    cols,
    rows,
    perPage: cols * rows,
  };
}

/** Screen rect of tray slot `index` (0 … perPage-1), centred horizontally. */
export function slotRect(l: PlayLayout, index: number): Rect {
  const col = index % l.cols;
  const row = Math.floor(index / l.cols);
  const used = l.cols * l.slot + (l.cols - 1) * l.gap;
  const x0 = l.tray.x + (l.tray.w - used) / 2;
  return { x: x0 + col * (l.slot + l.gap), y: l.tray.y + PAD + row * (l.slot + l.gap), w: l.slot, h: l.slot };
}

/** Index of the slot under a screen point, or -1. */
export function slotAt(l: PlayLayout, x: number, y: number): number {
  for (let i = 0; i < l.perPage; i++) {
    const r = slotRect(l, i);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

export const inTray = (l: PlayLayout, y: number) => y >= l.tray.y;
