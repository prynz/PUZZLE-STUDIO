import type { AssistProfile, AssistRules, Rect } from '@puzzle-studio/puzzle-engine';

/** A place in a pile: centre on screen and a slight turn (radians). */
export interface PileSpot {
  x: number;
  y: number;
  angle: number;
}

/**
 * Screen layout of the play canvas (concept 2 §4/§10): the board in the middle, loose pieces
 * lying in two loose piles – above and below the board – like on a real table.
 */
export interface PlayLayout {
  width: number;
  height: number;
  board: Rect;
  /** Pile above the board. */
  pileTop: Rect;
  /** Pile below the board. */
  tray: Rect;
  /** Size of one pile place (a piece fills about 88 % of it). */
  slot: number;
  /** Places per pile. */
  cols: number;
  /** Number of piles (always 2). */
  rows: number;
  /** Pieces lying in the piles at the same time. */
  perPage: number;
  spots: PileSpot[];
}

const PAD = 12;

/** Deterministic 0…1 "random" number – the piles look scattered but never jump between renders. */
const jitter = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Toddlers get very big pieces (2 per pile, ≥ 96 dp), the others 3 per pile (≥ 72 dp).
 * Places alternate between the piles, so the first pieces lie above and below the board.
 */
export function playLayout(width: number, height: number, profile: AssistProfile, rules: AssistRules): PlayLayout {
  const inner = width - PAD * 2;
  const toddler = profile === 'toddler';
  const max = toddler ? Math.min(4, rules.trayMaxVisible ?? 4) : 6;
  const cols = Math.max(1, Math.ceil(max / 2));
  let slot = toddler
    ? Math.max(96, Math.min(150, inner / (cols + 0.6)))
    : Math.max(72, Math.min(110, inner / (cols + 0.8)));
  // keep at least a third of the height for the board
  slot = Math.min(slot, Math.max(toddler ? 96 : 72, (height / 3 - PAD) / 1.15));
  const band = slot * 1.15 + PAD;
  const spots: PileSpot[] = [];
  for (let i = 0; i < max; i++) {
    const top = i % 2 === 0;
    const j = Math.floor(i / 2);
    const cellW = width / cols;
    spots.push({
      x: (j + 0.5) * cellW + (jitter(i + 1) - 0.5) * Math.max(0, cellW - slot) * 0.8,
      y: (top ? band / 2 : height - band / 2) + (jitter(i + 7) - 0.5) * slot * 0.12,
      angle: (jitter(i + 13) - 0.5) * 0.42,
    });
  }
  return {
    width,
    height,
    board: { x: PAD, y: band, w: inner, h: Math.max(80, height - band * 2) },
    pileTop: { x: 0, y: 0, w: width, h: band },
    tray: { x: 0, y: height - band, w: width, h: band },
    slot,
    cols,
    rows: 2,
    perPage: max,
    spots,
  };
}

/** Axis-aligned box of pile place `index` (0 … perPage-1). */
export function slotRect(l: PlayLayout, index: number): Rect {
  const s = l.spots[index] ?? { x: -l.slot, y: -l.slot, angle: 0 };
  return { x: s.x - l.slot / 2, y: s.y - l.slot / 2, w: l.slot, h: l.slot };
}

/** Index of the pile place under a screen point (the piece drawn on top wins), or -1. */
export function slotAt(l: PlayLayout, x: number, y: number): number {
  for (let i = l.spots.length - 1; i >= 0; i--) {
    const s = l.spots[i];
    if (s && Math.hypot(x - s.x, y - s.y) <= l.slot * 0.55) return i;
  }
  return -1;
}

/** True when a screen point lies in one of the piles (above or below the board). */
export const inTray = (l: PlayLayout, y: number) => y <= l.pileTop.y + l.pileTop.h || y >= l.tray.y;

/** The band between the piles – the board layer never draws into the piles. */
export const boardBand = (l: PlayLayout): Rect => ({
  x: 0,
  y: l.pileTop.y + l.pileTop.h,
  w: l.width,
  h: l.tray.y - (l.pileTop.y + l.pileTop.h),
});
