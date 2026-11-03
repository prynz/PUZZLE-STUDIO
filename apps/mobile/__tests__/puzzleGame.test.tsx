import { ENGINE_VERSION, assistFor, generatePuzzle, type PuzzleDefinition } from '@puzzle-studio/puzzle-engine';
import { act, renderHook } from '@testing-library/react-native';

import { basketViews, piecesIn } from '@/features/puzzle/game/baskets';
import { playLayout, slotAt, slotRect } from '@/features/puzzle/game/layout';
import { SAVE_DEBOUNCE_MS } from '@/features/puzzle/game/useAutosave';
import { useGame } from '@/features/puzzle/game/useGame';
import { clampView, fitView, toScreen, toWorld, zoomed } from '@/features/puzzle/game/viewport';
import { MIGRATIONS } from '@/storage/migrations';
import { createMemoryPuzzleStore } from '@/storage/puzzles/memoryPuzzleStore';
import type { StoredPuzzle } from '@/storage/puzzles/types';

const def = (rows: number, cols: number): PuzzleDefinition => ({
  engineVersion: ENGINE_VERSION,
  seed: 5,
  rows,
  cols,
  shape: 'classic',
  width: 1200,
  height: 900,
});

const stored = (rows: number, cols: number, profile: StoredPuzzle['profile'] = 'kid'): StoredPuzzle => ({
  id: 'p1',
  imageId: 'img-1',
  definition: def(rows, cols),
  profile,
  status: 'new',
  stateJson: null,
  placedCount: 0,
  createdAt: 1,
  updatedAt: 1,
  completedAt: null,
});

const AREA = { x: -300, y: -300, w: 1800, h: 1500 };

describe('play layout', () => {
  it('puts the tray below the board with child-sized slots', () => {
    const l = playLayout(390, 700, 'kid', assistFor('kid', 100));
    expect(l.rows).toBe(2);
    expect(l.slot).toBeGreaterThanOrEqual(64);
    expect(l.board.y + l.board.h).toBeLessThanOrEqual(l.tray.y);
    expect(slotAt(l, slotRect(l, 3).x + 5, slotRect(l, 3).y + 5)).toBe(3);
    expect(slotAt(l, 1, 1)).toBe(-1);
  });

  it('gives toddlers few, very big slots', () => {
    const l = playLayout(390, 700, 'toddler', assistFor('toddler', 256));
    expect(l.slot).toBeGreaterThanOrEqual(96);
    expect(l.perPage).toBeLessThanOrEqual(4);
    expect(l.rows).toBe(1);
  });
});

describe('viewport', () => {
  const area = { x: 10, y: 20, w: 300, h: 400 };
  const board = { x: 0, y: 0, w: 1200, h: 900 };
  it('fits the board and converts both ways', () => {
    const v = fitView(area, board);
    expect(v.scale).toBeCloseTo(0.25);
    const s = toScreen(v, 600, 450);
    expect(toWorld(v, s.x, s.y)).toEqual({ x: 600, y: 450 });
    expect(s.x).toBeCloseTo(area.x + area.w / 2);
  });

  it('zooms around a focus point and never loses the board', () => {
    const base = fitView(area, board);
    const z = zoomed(base, area, board, 2.75, { x: 600, y: 450 });
    expect(z.scale).toBeCloseTo(base.scale * 2.75);
    const far = clampView({ ...z, x: z.x + 10000 }, area, board);
    expect(toScreen(far, 600, 450).x).toBeLessThanOrEqual(area.x + area.w);
  });
});

describe('baskets', () => {
  const puzzle = generatePuzzle(def(6, 6));
  it('shows "Alle" and "Ränder" for 36 pieces and filters the tray', async () => {
    const rules = assistFor('kid', 36);
    const { result } = await renderHook(() => useGame(stored(6, 6), puzzle, async () => undefined));
    const views = basketViews(puzzle, result.current.state, rules, null, {
      all: 'Alle',
      edges: 'Ränder',
      corners: 'Ecken',
      custom: (n) => `Meine Schale ${n}`,
    });
    expect(views.map((v) => v.label)).toEqual(['Alle', 'Ränder']);
    expect(views[0]?.count).toBe(36);
    expect(views[1]?.count).toBe(20);
    expect(piecesIn(puzzle, result.current.state, 'corners', null)).toHaveLength(4);
  });
});

describe('useGame', () => {
  it('Pino hint + placing at the target locks the piece; all pieces → complete', async () => {
    const puzzle = generatePuzzle(def(2, 2));
    const { result } = await renderHook(() => useGame(stored(2, 2), puzzle, async () => undefined));
    for (let i = 0; i < 4; i++) {
      let id: number | null = null;
      await act(async () => {
        id = result.current.showHint();
      });
      expect(id).not.toBeNull();
      expect(result.current.selected).toBe(id);
      const cell = puzzle.pieces[id ?? 0]?.cell;
      await act(async () => {
        const fb = result.current.drop(id ?? 0, cell?.x ?? 0, cell?.y ?? 0, AREA);
        expect(fb.outcome).toBe('locked');
      });
    }
    expect(result.current.complete).toBe(true);
    expect(result.current.placed).toBe(4);
  });

  it('a misplaced piece glides aside (kid) – the toddler gets it back in the tray', async () => {
    const puzzle = generatePuzzle(def(3, 3));
    const kid = await renderHook(() => useGame(stored(3, 3, 'kid'), puzzle, async () => undefined));
    await act(async () => {
      expect(kid.result.current.drop(0, 900, 700, AREA).outcome).toBe('stayed');
    });
    const toddler = await renderHook(() => useGame(stored(3, 3, 'toddler'), puzzle, async () => undefined));
    await act(async () => {
      expect(toddler.result.current.drop(0, 900, 700, AREA).outcome).toBe('returned');
    });
    expect(toddler.result.current.source.length).toBeLessThanOrEqual(4);
  });

  it('saves 500 ms after a move and restores the saved game', async () => {
    jest.useFakeTimers();
    const puzzle = generatePuzzle(def(2, 2));
    const save = jest.fn(async () => undefined);
    const { result } = await renderHook(() => useGame(stored(2, 2), puzzle, save));
    await act(async () => {
      result.current.drop(1, 600, 0, AREA);
    });
    expect(save).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(SAVE_DEBOUNCE_MS + 10);
    });
    expect(save).toHaveBeenCalledTimes(1);
    const progress = (save.mock.calls[0] as unknown as [{ stateJson: string; placedCount: number }])[0];
    expect(progress.placedCount).toBe(1);
    jest.useRealTimers();

    const again = await renderHook(() =>
      useGame({ ...stored(2, 2), stateJson: progress.stateJson }, puzzle, async () => undefined),
    );
    expect(again.result.current.placed).toBe(1);
    expect(again.result.current.restoreFailed).toBe(false);
    const broken = await renderHook(() =>
      useGame({ ...stored(2, 2), stateJson: '{"v":1,"pieces":[]}' }, puzzle, async () => undefined),
    );
    expect(broken.result.current.restoreFailed).toBe(true);
    expect(broken.result.current.placed).toBe(0);
  });

  it('toddlers play in bites from 25 pieces', async () => {
    const puzzle = generatePuzzle(def(5, 5));
    const { result } = await renderHook(() => useGame(stored(5, 5, 'toddler'), puzzle, async () => undefined));
    expect(result.current.bites?.length).toBe(4);
    expect(result.current.bite?.id).toBe(0);
    result.current.source.forEach((id) => expect(result.current.bite?.pieces).toContain(id));
  });
});

describe('puzzle storage', () => {
  it('has a migration for puzzles and their saved state', () => {
    const v3 = MIGRATIONS.find((m) => m.version === 3);
    expect(v3?.sql).toMatch(/CREATE TABLE IF NOT EXISTS puzzle /);
    expect(v3?.sql).toMatch(/ON DELETE CASCADE/);
    expect(v3?.sql).toMatch(/puzzle_state/);
  });

  it('memory store: create → save → complete → reset', async () => {
    const store = createMemoryPuzzleStore();
    const p = await store.create({ imageId: 'img-1', definition: def(2, 2), profile: 'kid' });
    expect(p.status).toBe('new');
    const saved = await store.save(p.id, { stateJson: '{}', stateVersion: 1, placedCount: 2, completed: false });
    expect(saved).toMatchObject({ status: 'in_progress', placedCount: 2, completedAt: null });
    const done = await store.save(p.id, { stateJson: '{}', stateVersion: 1, placedCount: 4, completed: true });
    expect(done.status).toBe('completed');
    expect(done.completedAt).not.toBeNull();
    expect(await store.reset(p.id)).toMatchObject({ status: 'new', stateJson: null, placedCount: 0 });
    await store.remove(p.id);
    expect(await store.list()).toHaveLength(0);
  });
});
