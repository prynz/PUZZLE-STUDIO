/**
 * Play-help profiles (PO requirement 6): the profile – not the piece count – decides how the
 * game behaves. The piece count only decides how much there is (docs/product/gameplay-concept.md §2/§3).
 */

export type AssistProfile = 'toddler' | 'kid' | 'pro';

/** Where a wrongly placed piece goes: glide to a free spot nearby, or back to the tray. */
export type MisplaceMode = 'nudge' | 'return';

export type BasketKind = 'all' | 'edges' | 'corners' | 'colors' | 'custom';

export interface AssistRules {
  /** Snap radius as a fraction of the smaller piece side. */
  snapTolerance: number;
  misplaceDefault: MisplaceMode;
  /** Whether parents/children may switch the misplace mode. */
  misplaceChangeable: boolean;
  /** "Häppchen" mode: the picture is played in small regions (toddler, from 25 pieces). */
  bites: boolean;
  /** Visible baskets – empty = no baskets (sorting happens invisibly). */
  baskets: BasketKind[];
  /** Max. number of "Meine Schale" baskets. */
  maxCustomBaskets: number;
  /** Rename / reorder baskets (long press). */
  editBaskets: boolean;
  /** 0 = pieces lie around the board (small puzzles), otherwise rows in the tray. */
  trayRows: number;
  /** Max. pieces shown at once in the tray (null = as many as fit). */
  trayMaxVisible: number | null;
  /** Pino offers a hint after this many seconds without progress (null = only on request). */
  hintOfferAfterSec: number | null;
}

const SNAP: Record<AssistProfile, number> = { toddler: 0.35, kid: 0.26, pro: 0.18 };

export const BITES_FROM_PIECES = 25;
export const CUSTOM_BASKETS_FROM_PIECES = 144;
export const MAX_CUSTOM_BASKETS = 3;

function basketsFor(profile: AssistProfile, pieces: number): BasketKind[] {
  if (profile === 'toddler' || pieces < 25) return [];
  if (pieces < 64) return ['all', 'edges'];
  if (pieces < CUSTOM_BASKETS_FROM_PIECES) return ['all', 'edges', 'corners', 'colors'];
  return ['all', 'edges', 'corners', 'colors', 'custom'];
}

function trayRowsFor(profile: AssistProfile, pieces: number): number {
  if (profile === 'toddler') return pieces < BITES_FROM_PIECES ? 0 : 1;
  if (pieces < 25) return 0;
  return pieces < 64 ? 1 : 2;
}

export function assistFor(profile: AssistProfile, pieces: number): AssistRules {
  const baskets = basketsFor(profile, pieces);
  return {
    snapTolerance: SNAP[profile],
    // PO decision: default "stay loose + glide to a free spot"; toddlers always get the piece back.
    misplaceDefault: profile === 'toddler' ? 'return' : 'nudge',
    misplaceChangeable: profile !== 'toddler',
    bites: profile === 'toddler' && pieces >= BITES_FROM_PIECES,
    baskets,
    maxCustomBaskets: baskets.includes('custom') ? MAX_CUSTOM_BASKETS : 0,
    editBaskets: profile !== 'toddler' && baskets.length > 0,
    trayRows: trayRowsFor(profile, pieces),
    trayMaxVisible: profile === 'toddler' ? 4 : null,
    hintOfferAfterSec: profile === 'toddler' ? 20 : profile === 'kid' ? 45 : null,
  };
}
