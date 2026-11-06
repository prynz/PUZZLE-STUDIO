/**
 * Stars, achievements and rewards (docs/product/progression.md). Pure and deterministic.
 *
 * Tone (product-concept.md): few, friendly milestones – no time limits, no streaks, no loss.
 * Everything is derived from an append-only log of completed puzzles, so replaying a puzzle
 * ("Nochmal puzzeln") never takes anything away.
 */

export type SourceKind = 'camera' | 'library' | 'sample';
export type PieceShapeKind = 'classic' | 'square';

/** One finished puzzle (one row per completion). */
export interface Completion {
  puzzleId: string;
  pieces: number;
  shape: PieceShapeKind;
  sourceKind: SourceKind;
  completedAt: number;
}

export type RewardKind = 'frame' | 'sticker' | 'background';

export interface Reward {
  id: string;
  kind: RewardKind;
}

export interface Stats {
  /** Distinct finished puzzles. */
  puzzles: number;
  /** Largest finished puzzle (pieces). */
  biggest: number;
  stars: number;
  ownPhoto: boolean;
  shapes: ReadonlySet<PieceShapeKind>;
}

export interface Achievement {
  id: string;
  reward: Reward;
  /** True when reached – depends only on the stats. */
  reached: (s: Stats) => boolean;
}

/** Stars for one puzzle: bigger puzzles shine more – never for speed. */
export function starsFor(pieces: number): 1 | 2 | 3 {
  if (pieces <= 16) return 1;
  if (pieces <= 64) return 2;
  return 3;
}

/** Stats from the completion log. A puzzle counts once – with its biggest completion. */
export function statsFrom(log: readonly Completion[]): Stats {
  const best = new Map<string, Completion>();
  for (const c of log) {
    const prev = best.get(c.puzzleId);
    if (!prev || c.pieces > prev.pieces) best.set(c.puzzleId, c);
  }
  const list = [...best.values()];
  return {
    puzzles: list.length,
    biggest: list.reduce((m, c) => Math.max(m, c.pieces), 0),
    stars: list.reduce((s, c) => s + starsFor(c.pieces), 0),
    ownPhoto: list.some((c) => c.sourceKind !== 'sample'),
    shapes: new Set(list.map((c) => c.shape)),
  };
}

/** The milestones in display order. Ids are stored – never rename them. */
export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first_puzzle', reward: { id: 'frame_sun', kind: 'frame' }, reached: (s) => s.puzzles >= 1 },
  { id: 'three_puzzles', reward: { id: 'sticker_wave', kind: 'sticker' }, reached: (s) => s.puzzles >= 3 },
  { id: 'own_photo', reward: { id: 'frame_rainbow', kind: 'frame' }, reached: (s) => s.ownPhoto },
  { id: 'pieces_25', reward: { id: 'sticker_star', kind: 'sticker' }, reached: (s) => s.biggest >= 25 },
  { id: 'both_shapes', reward: { id: 'sticker_heart', kind: 'sticker' }, reached: (s) => s.shapes.size >= 2 },
  { id: 'pieces_64', reward: { id: 'background_meadow', kind: 'background' }, reached: (s) => s.biggest >= 64 },
  { id: 'ten_puzzles', reward: { id: 'background_sky', kind: 'background' }, reached: (s) => s.puzzles >= 10 },
  { id: 'pieces_100', reward: { id: 'frame_gold', kind: 'frame' }, reached: (s) => s.biggest >= 100 },
  { id: 'stars_25', reward: { id: 'background_dream', kind: 'background' }, reached: (s) => s.stars >= 25 },
  { id: 'pieces_256', reward: { id: 'sticker_trophy', kind: 'sticker' }, reached: (s) => s.biggest >= 256 },
];

export const REWARDS: readonly Reward[] = ACHIEVEMENTS.map((a) => a.reward);

/**
 * Achievements reached by the log that are not unlocked yet (in display order).
 * Unlocks are permanent: deleting puzzles never locks anything again.
 */
export function newlyReached(log: readonly Completion[], unlocked: ReadonlySet<string>): Achievement[] {
  const stats = statsFrom(log);
  return ACHIEVEMENTS.filter((a) => !unlocked.has(a.id) && a.reached(stats));
}

/** Rewards that belong to unlocked achievements, optionally of one kind. */
export function unlockedRewards(unlocked: ReadonlySet<string>, kind?: RewardKind): Reward[] {
  return ACHIEVEMENTS.filter((a) => unlocked.has(a.id) && (!kind || a.reward.kind === kind)).map((a) => a.reward);
}

/** A chosen reward is only valid while it is unlocked – otherwise fall back to "none". */
export function validChoice(choice: string | null, unlocked: ReadonlySet<string>, kind: RewardKind): string | null {
  if (!choice) return null;
  return unlockedRewards(unlocked, kind).some((r) => r.id === choice) ? choice : null;
}

/**
 * The next milestone on Pino's journey (start screen): the first one in display order that is
 * not unlocked yet. Returns ACHIEVEMENTS.length when the journey is complete.
 */
export function nextMilestoneIndex(unlocked: ReadonlySet<string>): number {
  const i = ACHIEVEMENTS.findIndex((a) => !unlocked.has(a.id));
  return i === -1 ? ACHIEVEMENTS.length : i;
}
