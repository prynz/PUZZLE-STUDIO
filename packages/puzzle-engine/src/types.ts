/** Shared engine types. Coordinates are in IMAGE SPACE (0..width, 0..height of the work image). */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Renderer-independent path (Skia, SVG and tests all consume this). */
export type PathCommand =
  | { op: 'M'; x: number; y: number }
  | { op: 'L'; x: number; y: number }
  | { op: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { op: 'Z' };

/** `classic` = jigsaw tabs, `square` = straight cuts (youngest children). */
export type PieceShapeStyle = 'classic' | 'square';

/** Bump when the geometry changes; old puzzles keep their version (docs/puzzle-engine/serialization.md). */
export const ENGINE_VERSION = 1;

/** Everything needed to regenerate a puzzle bit-identically. Geometry itself is never stored. */
export interface PuzzleDefinition {
  engineVersion: number;
  seed: number;
  rows: number;
  cols: number;
  shape: PieceShapeStyle;
  /** Size of the work image (image space). */
  width: number;
  height: number;
}

/** 1 = tab (bulges outward), -1 = blank (bulges inward), 0 = flat (border or square style). */
export type EdgeSign = -1 | 0 | 1;

export type PieceKind = 'corner' | 'edge' | 'inner';

export interface PieceShape {
  /** row * cols + col */
  id: number;
  row: number;
  col: number;
  /** Target cell in image space – also the image region the piece shows. */
  cell: Rect;
  /** Cell including tabs (conservative: contains the whole outline). */
  bounds: Rect;
  edges: { top: EdgeSign; right: EdgeSign; bottom: EdgeSign; left: EdgeSign };
  /** From the grid position (also correct for the square style). */
  kind: PieceKind;
  /** Outline at the home position, clockwise. */
  path: PathCommand[];
  /** Flattened outline at the home position as [x0, y0, x1, y1, …] – used for hit-testing. */
  outline: number[];
}

export interface Puzzle {
  definition: PuzzleDefinition;
  pieceWidth: number;
  pieceHeight: number;
  pieces: PieceShape[];
}
