export * from './types.ts';
export { createRandom, shuffled } from './random.ts';
export { chooseGrid, isValidGrid, MIN_GRID, MAX_GRID, PIECE_PRESETS, type GridSize } from './grid.ts';
export { generatePuzzle, pieceAt, tabReach, toSvgPath, fitBoard } from './puzzle.ts';
export { hitShapesFor, buildHitGrid, hitTest, pointInPolygon, type HitShapes, type HitGrid } from './hitTest.ts';
export {
  assistFor,
  BITES_FROM_PIECES,
  CUSTOM_BASKETS_FROM_PIECES,
  MAX_CUSTOM_BASKETS,
  type AssistProfile,
  type AssistRules,
  type BasketKind,
  type MisplaceMode,
} from './assist.ts';
export * from './state.ts';
export { suggestPiece } from './hints.ts';
export { planBites, activeBite, biteTray, splitTwosThrees, type Bite } from './bites.ts';
export {
  serializeState,
  parseState,
  migrateState,
  STATE_VERSION,
  type PuzzleStateV1,
  type ParseResult,
} from './serialize.ts';
