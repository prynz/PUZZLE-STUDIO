import { buildHitGrid, hitTest, type HitShapes, type Puzzle, type Rect } from '@puzzle-studio/puzzle-engine';
import { useMemo, useRef } from 'react';
import { usePanGesture } from 'react-native-gesture-handler';
import { spring } from '@puzzle-studio/ui';
import { Easing, withSequence, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

import { inTray, slotAt, type PlayLayout } from '../game/layout';
import { trayPlacement } from './drawPieces';
import type { Game } from '../game/useGame';
import { toScreen, toWorld, type View } from '../game/viewport';

const TAP_SLOP = 10;
const SNAP_MS = 170;
const BACK_MS = 280;
/** Lifted pieces grow a little – they feel picked up. */
const LIFT = 1.08;
/** Strongest tilt while dragging (radians, ≈ 10°) and how fast the finger has to move for it. */
const MAX_TILT = 0.18;
const TILT_SPEED = 1400;
const tiltSpring = { damping: 11, stiffness: 160, mass: 0.6 };

/** Where the piece came from – a piece that does not fit floats back there. */
interface Origin {
  x: number;
  y: number;
  scale: number;
}
type Grab =
  | { kind: 'tray' | 'loose'; id: number; offX: number; offY: number; origin: Origin }
  | { kind: 'board' }
  | { kind: 'none' };

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
  drag: { x: SharedValue<number>; y: SharedValue<number>; scale: SharedValue<number>; tilt: SharedValue<number> };
  setDragging: (id: number | null) => void;
  /** A piece just snapped into place (for the flash). */
  onLocked: (id: number) => void;
}

/**
 * One pan gesture for the whole play surface (runs on the JS thread; only the dragged piece's
 * position is a shared value): drag from tray or board, tap-to-select, tap-to-place, pan when zoomed.
 *
 * The dragged piece is alive (concept 2 §4): it is lifted (grows with a little bounce), leans
 * into the direction it is pulled, squashes softly when it snaps in and floats back to where
 * it came from when it does not fit. With Reduced Motion it simply moves.
 */
export function usePlayGestures(i: GestureInput) {
  const { puzzle, game, layout, view, playArea, trayIds, reduceMotion, shapes, drag, setDragging, onLocked } = i;
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

  /** The live piece is positioned by its centre (it grows and leans around the middle). */
  const centre = (id: number, x: number, y: number, scale: number) => {
    const c = puzzle.pieces[id]?.cell;
    return { x: x + ((c?.w ?? 0) * scale) / 2, y: y + ((c?.h ?? 0) * scale) / 2 };
  };

  const beginDrag = (id: number, x: number, y: number) => {
    const c = centre(id, x, y, view.scale);
    drag.x.set(c.x);
    drag.y.set(c.y);
    drag.tilt.set(0);
    drag.scale.set(reduceMotion ? view.scale : withSpring(view.scale * LIFT, spring.bouncy));
    setDragging(id);
  };

  const floatBack = (id: number, origin: Origin) => {
    const ease = { duration: BACK_MS, easing: Easing.out(Easing.cubic) };
    const c = centre(id, origin.x, origin.y, origin.scale);
    drag.x.set(withTiming(c.x, ease));
    drag.y.set(withTiming(c.y, ease));
    drag.scale.set(withTiming(origin.scale, ease));
    setTimeout(() => setDragging(null), BACK_MS + 20);
  };

  const finishDrag = (id: number, sx: number, sy: number, fingerY: number, origin: Origin, fromTray: boolean) => {
    drag.tilt.set(reduceMotion ? 0 : withSpring(0, tiltSpring));
    // released over the tray: back into the tray (no move counted)
    if (inTray(layout, fingerY)) {
      if (!fromTray) game.toTray(id);
      if (fromTray && !reduceMotion) floatBack(id, origin);
      else setDragging(null);
      return;
    }
    const w = toWorld(view, sx, sy);
    const fb = game.drop(id, w.x, w.y, playArea);
    if (fb.outcome === 'locked') onLocked(id);
    if (reduceMotion) {
      setDragging(null);
      return;
    }
    if (fb.outcome === 'returned') {
      floatBack(id, origin);
      return;
    }
    const tl = toScreen(view, fb.x, fb.y);
    const target = centre(id, tl.x, tl.y, view.scale);
    drag.x.set(withTiming(target.x, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
    drag.y.set(withTiming(target.y, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
    // snapping in: a soft squash, then it settles at board size
    drag.scale.set(
      fb.outcome === 'locked'
        ? withSequence(withTiming(view.scale * 0.94, { duration: SNAP_MS }), withSpring(view.scale, spring.snap))
        : withTiming(view.scale, { duration: SNAP_MS }),
    );
    setTimeout(() => setDragging(null), fb.outcome === 'locked' ? SNAP_MS + 200 : SNAP_MS + 20);
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
          origin: trayPlacement(puzzle, layout, piece, slot),
        };
        return;
      }
      const w = toWorld(view, e.x, e.y);
      const id = hit(w.x, w.y);
      const rt = id >= 0 ? state.pieces[id] : undefined;
      if (rt) {
        const s = toScreen(view, rt.x, rt.y);
        grab.current = { kind: 'loose', id, offX: e.x - s.x, offY: e.y - s.y, origin: { ...s, scale: view.scale } };
      } else grab.current = { kind: 'board' };
    },
    onUpdate: (e) => {
      const st = start.current;
      if (!st.moved && Math.hypot(e.x - st.x, e.y - st.y) < TAP_SLOP) return;
      const g = grab.current;
      if (!st.moved) {
        st.moved = true;
        if (g.kind === 'tray' || g.kind === 'loose') beginDrag(g.id, e.x - g.offX, e.y - g.offY);
      }
      if (g.kind === 'tray' || g.kind === 'loose') {
        const c = centre(g.id, e.x - g.offX, e.y - g.offY, view.scale);
        drag.x.set(c.x);
        drag.y.set(c.y);
        if (!reduceMotion) {
          // lean into the pull: faster sideways movement → stronger tilt (springy, never more than ~10°)
          const lean = Math.max(-1, Math.min(1, e.velocityX / TILT_SPEED)) * MAX_TILT;
          drag.tilt.set(withSpring(lean, tiltSpring));
        }
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
      if (g.kind === 'tray' || g.kind === 'loose')
        finishDrag(g.id, e.x - g.offX, e.y - g.offY, e.y, g.origin, g.kind === 'tray');
    },
  });
}
