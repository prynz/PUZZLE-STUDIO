import type { ColorGroup } from '@puzzle-studio/image-processing';
import type { AssistRules, Puzzle, PuzzleState } from '@puzzle-studio/puzzle-engine';

export type BasketKind = 'all' | 'edges' | 'corners' | 'color' | 'custom';

export interface BasketView {
  id: string;
  kind: BasketKind;
  /** Suggested name (i18n / color group) or the child's own name. */
  label: string;
  /** Group colour for colour baskets (#RRGGBB from the picture). */
  swatch?: string;
  count: number;
}

export interface BasketLabels {
  all: string;
  edges: string;
  corners: string;
  custom: (n: number) => string;
}

/** Tray pieces of a basket, in tray order. Pieces in a custom basket only appear there. */
export function piecesIn(
  puzzle: Puzzle,
  state: PuzzleState,
  basketId: string,
  groups: readonly ColorGroup[] | null,
): number[] {
  const tray = state.trayOrder;
  if (basketId.startsWith('mine-')) return tray.filter((id) => state.pieces[id]?.basket === basketId);
  const free = tray.filter((id) => state.pieces[id]?.basket === undefined);
  switch (basketId) {
    case 'all':
      return free;
    case 'edges':
      return free.filter((id) => puzzle.pieces[id]?.kind !== 'inner');
    case 'corners':
      return free.filter((id) => puzzle.pieces[id]?.kind === 'corner');
    default: {
      const group = groups?.find((g) => `color-${g.id}` === basketId);
      if (!group) return free;
      const members = new Set(group.members);
      return free.filter((id) => members.has(id));
    }
  }
}

/** Baskets to show for this profile and puzzle size, with the child's names and order applied. */
export function basketViews(
  puzzle: Puzzle,
  state: PuzzleState,
  rules: AssistRules,
  groups: readonly ColorGroup[] | null,
  labels: BasketLabels,
): BasketView[] {
  const out: BasketView[] = [];
  const add = (id: string, kind: BasketKind, label: string, swatch?: string) =>
    out.push({
      id,
      kind,
      label,
      count: piecesIn(puzzle, state, id, groups).length,
      ...(swatch ? { swatch } : {}),
    });
  if (rules.baskets.includes('all')) add('all', 'all', labels.all);
  if (rules.baskets.includes('edges')) add('edges', 'edges', labels.edges);
  if (rules.baskets.includes('corners')) add('corners', 'corners', labels.corners);
  if (rules.baskets.includes('colors') && groups)
    for (const g of groups) add(`color-${g.id}`, 'color', g.name, g.color);
  if (rules.baskets.includes('custom'))
    state.baskets.filter((b) => b.custom).forEach((b, i) => add(b.id, 'custom', labels.custom(i + 1)));

  const prefs = new Map(state.baskets.map((b) => [b.id, b]));
  return out
    .map((b, i) => {
      const pref = prefs.get(b.id);
      return { view: pref?.label ? { ...b, label: pref.label } : b, order: pref ? pref.order : 1000 + i, i };
    })
    .sort((a, b) => a.order - b.order || a.i - b.i)
    .map((x) => x.view);
}
