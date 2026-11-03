import type { ColorGroup } from '@puzzle-studio/image-processing';
import {
  activeBite,
  addCustomBasket,
  assistFor,
  biteTray,
  createState,
  dropPiece,
  isComplete,
  lockedCount,
  orderBaskets,
  parseState,
  placeLoose,
  planBites,
  putInBasket,
  renameBasket,
  returnToTray,
  setReferenceVisible,
  suggestPiece,
  type DropOutcome,
  type Puzzle,
  type PuzzleState,
  type Rect,
} from '@puzzle-studio/puzzle-engine';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { SaveProgress, StoredPuzzle } from '@/storage/puzzles/types';

import { piecesIn } from './baskets';
import { useAutosave } from './useAutosave';

function initialState(stored: StoredPuzzle, puzzle: Puzzle): { state: PuzzleState; restoreFailed: boolean } {
  const misplaceMode = assistFor(stored.profile, puzzle.pieces.length).misplaceDefault;
  const fresh = () => createState(puzzle, { seed: stored.definition.seed + 1, misplaceMode });
  if (!stored.stateJson) return { state: fresh(), restoreFailed: false };
  const parsed = parseState(puzzle, stored.stateJson);
  return parsed.ok ? { state: parsed.state, restoreFailed: false } : { state: fresh(), restoreFailed: true };
}

export interface DropFeedback {
  id: number;
  outcome: DropOutcome;
  x: number;
  y: number;
}

/**
 * Game session: engine state, selection, baskets, hints, bites and autosave.
 * All rules come from the engine (`assistFor`, `dropPiece`, …) – this hook only wires them to the UI.
 */
export function useGame(stored: StoredPuzzle, puzzle: Puzzle, save: (progress: SaveProgress) => Promise<void>) {
  const rules = useMemo(() => assistFor(stored.profile, puzzle.pieces.length), [stored.profile, puzzle]);
  const [{ state, restoreFailed }, setSession] = useState(() => initialState(stored, puzzle));
  const setState = useCallback(
    (update: (s: PuzzleState) => PuzzleState) => setSession((prev) => ({ ...prev, state: update(prev.state) })),
    [],
  );
  // Latest state for event handlers that must compute a result right away (drop feedback).
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  }, [state]);
  const [basketId, setBasketId] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<number | null>(null);
  const [groups, setGroups] = useState<ColorGroup[] | null>(null);

  // ---- toddler bites ------------------------------------------------------------------
  const bites = useMemo(() => (rules.bites ? planBites(puzzle) : null), [rules.bites, puzzle]);
  const bite = bites ? activeBite(bites, state) : null;

  // ---- what the tray shows ------------------------------------------------------------
  const source = useMemo(() => {
    if (bite) return biteTray(bite, state, rules.trayMaxVisible ?? 4);
    if (rules.trayMaxVisible !== null) return state.trayOrder.slice(0, rules.trayMaxVisible);
    if (rules.baskets.length === 0) return state.trayOrder;
    return piecesIn(puzzle, state, basketId, groups);
  }, [bite, state, rules, puzzle, basketId, groups]);

  const complete = isComplete(state);
  const placed = lockedCount(state);

  useAutosave(puzzle, state, save);

  // ---- moves ------------------------------------------------------------------------
  const lift = useCallback((id: number, x: number, y: number) => setState((s) => placeLoose(s, id, x, y)), [setState]);

  const drop = useCallback(
    (id: number, x: number, y: number, area: Rect): DropFeedback => {
      const r = dropPiece(puzzle, latest.current, id, x, y, { tolerance: rules.snapTolerance, area });
      latest.current = r.state;
      setState(() => r.state);
      setSelected(null);
      setHint((h) => (h === id ? null : h));
      return { id, outcome: r.outcome, x: r.x, y: r.y };
    },
    [puzzle, rules.snapTolerance, setState],
  );

  const toTray = useCallback((id: number) => setState((s) => returnToTray(s, id)), [setState]);

  // ---- hints ------------------------------------------------------------------------
  const showHint = useCallback(() => {
    const among = bite ? bite.pieces : basketId !== 'all' && source.length > 0 ? source : undefined;
    const id = suggestPiece(puzzle, state, among) ?? suggestPiece(puzzle, state);
    if (id === null) return null;
    if (state.pieces[id]?.state === 'tray') {
      // make sure the child sees it: first in the tray, on the first page of a basket that holds it
      setState((s) => returnToTray(s, id));
      if (!source.includes(id)) setBasketId(state.pieces[id]?.basket ?? 'all');
      setPage(0);
    }
    setSelected(id);
    setHint(id);
    return id;
  }, [bite, basketId, source, puzzle, state, setState]);

  // ---- baskets ----------------------------------------------------------------------
  const chooseBasket = useCallback(
    (id: string) => {
      // a selected tray piece + tap on "Meine Schale" = put it in there
      if (selected !== null && id.startsWith('mine-') && state.pieces[selected]?.state === 'tray') {
        setState((s) => putInBasket(s, selected, id));
        setSelected(null);
        return;
      }
      setBasketId(id);
      setPage(0);
    },
    [selected, state, setState],
  );
  const rename = useCallback(
    (displayOrder: string[], id: string, label: string) =>
      setState((s) => renameBasket(orderBaskets(s, displayOrder), id, label)),
    [setState],
  );
  const move = useCallback(
    (displayOrder: string[], id: string, delta: -1 | 1) => {
      const i = displayOrder.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= displayOrder.length) return;
      const next = displayOrder.slice();
      next[i] = displayOrder[j] as string;
      next[j] = id;
      setState((s) => orderBaskets(s, next));
    },
    [setState],
  );
  const addBasket = useCallback(() => {
    const r = addCustomBasket(latest.current, '');
    if (!r) return null;
    latest.current = r.state;
    setState(() => r.state);
    return r.id;
  }, [setState]);

  const restart = useCallback(() => {
    setSession({
      state: createState(puzzle, { seed: (Date.now() & 0xffff) + 1, misplaceMode: rules.misplaceDefault }),
      restoreFailed: false,
    });
    setSelected(null);
    setHint(null);
    setBasketId('all');
    setPage(0);
  }, [puzzle, rules.misplaceDefault]);

  const toggleReference = useCallback(() => setState((s) => setReferenceVisible(s, !s.referenceVisible)), [setState]);

  return {
    profile: stored.profile,
    rules,
    state,
    restoreFailed,
    complete,
    placed,
    bites,
    bite,
    source,
    basketId,
    page,
    setPage,
    selected,
    setSelected,
    hint,
    groups,
    setGroups,
    lift,
    drop,
    toTray,
    showHint,
    chooseBasket,
    rename,
    move,
    addBasket,
    restart,
    toggleReference,
  };
}

export type Game = ReturnType<typeof useGame>;
