import { describe, expect, it } from 'vitest';

import {
  ACHIEVEMENTS,
  REWARDS,
  newlyReached,
  nextMilestoneIndex,
  starsFor,
  statsFrom,
  unlockedRewards,
  validChoice,
  type Completion,
} from '../src/index.ts';

const done = (puzzleId: string, pieces: number, over: Partial<Completion> = {}): Completion => ({
  puzzleId,
  pieces,
  shape: 'classic',
  sourceKind: 'sample',
  completedAt: 1,
  ...over,
});

describe('stars', () => {
  it('grow with the puzzle size (never with speed)', () => {
    expect([4, 16, 25, 64, 100, 256].map(starsFor)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe('statsFrom', () => {
  it('counts each puzzle once – replaying adds nothing, takes nothing', () => {
    const log = [done('a', 9), done('a', 9), done('b', 36), done('a', 9)];
    expect(statsFrom(log)).toMatchObject({ puzzles: 2, biggest: 36, stars: 3, ownPhoto: false });
  });

  it('uses the biggest completion of a puzzle and notices own photos and shapes', () => {
    const s = statsFrom([done('a', 9), done('a', 100), done('b', 4, { sourceKind: 'camera', shape: 'square' })]);
    expect(s).toMatchObject({ puzzles: 2, biggest: 100, stars: 4, ownPhoto: true });
    expect([...s.shapes].sort()).toEqual(['classic', 'square']);
  });

  it('is empty for an empty log', () => {
    expect(statsFrom([])).toMatchObject({ puzzles: 0, biggest: 0, stars: 0, ownPhoto: false });
  });
});

describe('achievements', () => {
  it('have unique ids and unique rewards of every kind', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    expect(new Set(REWARDS.map((r) => r.id)).size).toBe(REWARDS.length);
    for (const kind of ['frame', 'sticker', 'background'] as const)
      expect(REWARDS.filter((r) => r.kind === kind).length).toBeGreaterThanOrEqual(3);
  });

  it('first puzzle unlocks the first milestone, then nothing new without progress', () => {
    const log = [done('a', 4)];
    expect(newlyReached(log, new Set()).map((a) => a.id)).toEqual(['first_puzzle']);
    expect(newlyReached(log, new Set(['first_puzzle']))).toEqual([]);
  });

  it('a big own photo puzzle unlocks several at once, in display order', () => {
    const ids = newlyReached([done('a', 100, { sourceKind: 'library' })], new Set()).map((a) => a.id);
    expect(ids).toEqual(['first_puzzle', 'own_photo', 'pieces_25', 'pieces_64', 'pieces_100']);
  });

  it('counting milestones: 3 and 10 puzzles, 25 stars, both shapes, 256 pieces', () => {
    const many = Array.from({ length: 10 }, (_, i) => done(`p${i}`, 100, { shape: i % 2 ? 'square' : 'classic' }));
    const ids = newlyReached([...many, done('big', 256)], new Set()).map((a) => a.id);
    for (const id of ['three_puzzles', 'ten_puzzles', 'both_shapes', 'stars_25', 'pieces_256'])
      expect(ids).toContain(id);
  });
});

describe('rewards', () => {
  const unlocked = new Set(['first_puzzle', 'pieces_64']);
  it('belong to unlocked achievements, filterable by kind', () => {
    expect(unlockedRewards(unlocked).map((r) => r.id)).toEqual(['frame_sun', 'background_meadow']);
    expect(unlockedRewards(unlocked, 'background').map((r) => r.id)).toEqual(['background_meadow']);
    expect(unlockedRewards(new Set())).toEqual([]);
  });

  it('a chosen reward must be unlocked and of the right kind', () => {
    expect(validChoice('background_meadow', unlocked, 'background')).toBe('background_meadow');
    expect(validChoice('background_sky', unlocked, 'background')).toBeNull();
    expect(validChoice('frame_sun', unlocked, 'background')).toBeNull();
    expect(validChoice(null, unlocked, 'frame')).toBeNull();
  });
});

describe('nextMilestoneIndex', () => {
  it('points at the first milestone not reached yet – also when later ones came first', () => {
    expect(nextMilestoneIndex(new Set())).toBe(0);
    expect(nextMilestoneIndex(new Set(['first_puzzle']))).toBe(1);
    expect(nextMilestoneIndex(new Set(['first_puzzle', 'own_photo']))).toBe(1);
  });

  it('reports a finished journey', () => {
    expect(nextMilestoneIndex(new Set(ACHIEVEMENTS.map((a) => a.id)))).toBe(ACHIEVEMENTS.length);
  });
});
