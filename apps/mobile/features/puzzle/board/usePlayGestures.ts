import { buildHitGrid, hitTest, type HitShapes, type Puzzle, type Rect } from '@puzzle-studio/puzzle-engine';
import { useMemo, useRef } from 'react';
import { usePanGesture } from 'react-native-gesture-handler';
import { Easing, withTiming, type SharedValue } from 'react-native-reanimated';

import { inTray, slotAt, type PlayLayout } from '../game/layout';
import type { Game } from '../game/useGame';
import { toScreen, toWorld, type View } from '../game/viewport';

const TAP_SLOP = 10;
const SNAP_MS = 170;

type Grab = { kind: 'tray' | 'loose'; id: number; offX: number; offY: number } | { kind: 'board' } | { kind: 'none' };

export interface GestureInput {
  puzzle: Puzzle;
  game: Game;
  layout: PlayLayout;
  view: View;
  playArea: Rect;
  trayIds: readonly number[];
  reduceMotion: boolean;
  shapes: HitShapes;
  onPan: (dx: number, dy: number) => void;
  drag: { x: SharedValue<number>; y: SharedValue<number>; scale: SharedValue<number> };
  setDragging: (id: number | null) => void;
}

/**
 * One pan gesture for the whole play surface (runs on the JS thread; only the dragged piece's
 * position is a shared value): drag from tray or board, tap-to-select, tap-to-place, pan when zoomed.
 */
export function usePlayGestures(i: GestureInput) {
  const { puzzle, game, layout, view, playArea, trayIds, reduceMotion, shapes, drag, setDragging } = i;
  const { state } = game;
  const grab = useRef<Grab>({ kind: 'none' });
  const start = useRef({ x: 0, y: 0, last: { x: 0, y: 0 }, moved: false });

  // ---- hit-testing loose pieces (engine, exact outlines) -----------------------------
  const hit = useMemo(() => {
    const xs = state.pieces.map((p) => p.x);
    const ys = state.pieces.map((p) => p.y);
    const rank = new Array<number>(state.pieces.length).fill(-1);
    state.z.forEach((id, i) => (rank[id] = i));
    const grid = buildHitGrid(shapes, xs, ys, state.z, playArea, Math.max(puzzle.pieceWidth, puzzle.pieceHeight));
    return (wx: number, wy: number) => hitTest(wx, wy, grid, shapes, xs, ys, rank);
  }, [state, shapes, playArea, puzzle]);

  const beginDrag = (id: number, x: number, y: number) => {
    drag.x.set(x);
    drag.y.set(y);
    setDragging(id);
  };

  const finishDrag = (id: number, sx: number, sy: number, fingerY: number, fromTray: boolean) => {
    // released over the tray: back into the tray (no move counted)
    if (inTray(layout, fingerY)) {
      if (!fromTray) game.toTray(id);
      setDragging(null);
      return;
    }
    const w = toWorld(view, sx, sy);
    const fb = game.drop(id, w.x, w.y, playArea);
    if (fb.outcome === 'returned' || reduceMotion) {
      setDragging(null);
      return;
    }
    const target = toScreen(view, fb.x, fb.y);
    drag.x.set(withTiming(target.x, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
    drag.y.set(withTiming(target.y, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
    setTimeout(() => setDragging(null), SNAP_MS + 20);
  };

  const onTap = (x: number, y: number) => {
    if (inTray(layout, y)) {
      const slot = slotAt(layout, x, y);
      const id = slot >= 0 ? trayIds[slot] : undefined;
      game.setSelected(id === undefined || id === game.selected ? null : id);
      return;
    }
    const w = toWorld(view, x, y);
    const id = hit(w.x, w.y);
    if (id >= 0 && game.selected === null) {
      game.setSelected(id);
      return;
    }
    if (game.selected !== null) {
      // tap-to-place: the selected piece goes where the child tapped (its centre under the finger)
      game.drop(game.selected, w.x - puzzle.pieceWidth / 2, w.y - puzzle.pieceHeight / 2, playArea);
    }
  };

  return usePanGesture({
    runOnJS: true,
    minDistance: 0,
    onBegin: (e) => {
      start.current = { x: e.x, y: e.y, last: { x: e.x, y: e.y }, moved: false };
      if (inTray(layout, e.y)) {
        const slot = slotAt(layout, e.x, e.y);
        const id = slot >= 0 ? trayIds[slot] : undefined;
        const piece = id === undefined ? undefined : puzzle.pieces[id];
        if (id === undefined || !piece) {
          grab.current = { kind: 'none' };
          return;
        }
        // the piece is lifted to board size, centred under the finger
        grab.current = {
          kind: 'tray',
          id,
          offX: (piece.cell.w / 2) * view.scale,
          offY: (piece.cell.h / 2) * view.scale,
        };
        return;
      }
      const w = toWorld(view, e.x, e.y);
      const id = hit(w.x, w.y);
      const rt = id >= 0 ? state.pieces[id] : undefined;
      if (rt) {
        const s = toScreen(view, rt.x, rt.y);
        grab.current = { kind: 'loose', id, offX: e.x - s.x, offY: e.y - s.y };
      } else grab.current = { kind: 'board' };
    },
    onUpdate: (e) => {
      const st = start.current;
      if (!st.moved && Math.hypot(e.x - st.x, e.y - st.y) < TAP_SLOP) return;
      const g = grab.current;
      if (!st.moved) {
        st.moved = true;
        if (g.kind === 'tray' || g.kind === 'loose') {
          drag.scale.set(view.scale);
          beginDrag(g.id, e.x - g.offX, e.y - g.offY);
        }
      }
      if (g.kind === 'tray' || g.kind === 'loose') {
        drag.x.set(e.x - g.offX);
        drag.y.set(e.y - g.offY);
      } else if (g.kind === 'board') {
        i.onPan(e.x - st.last.x, e.y - st.last.y);
      }
      st.last = { x: e.x, y: e.y };
    },
    onFinalize: (e) => {
      const g = grab.current;
      grab.current = { kind: 'none' };
      if (!start.current.moved) {
        onTap(e.x, e.y);
        return;
      }
      if (g.kind === 'tray' || g.kind === 'loose') finishDrag(g.id, e.x - g.offX, e.y - g.offY, e.y, g.kind === 'tray');
    },
  });
}
