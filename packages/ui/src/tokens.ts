/**
 * PUZZLE STUDIO – Design Tokens (single source of truth)
 *
 * Derived from docs/design/reference/visual-style-reference.png and the
 * palette in PROJECT_BRIEF.md. Documented in docs/design/design-system.md.
 *
 * Rules:
 *  - Screens and components never use raw hex values – only these tokens.
 *  - This file is platform-agnostic (no React Native imports) so it can be
 *    consumed by the app, by tests and by the design-preview renderer.
 */

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

/** Raw palette. Prefer the semantic `color` map below in UI code. */
export const palette = {
  cream: '#FFF8ED',
  cream200: '#FFF1DC',
  cream300: '#FBE6C8',
  pink: '#F9EAF0',
  pink300: '#F3D3E0',

  lavender100: '#EFEAFE',
  lavender200: '#DCD3FC',
  lavender: '#B9A7F8',
  purple: '#9983D4',
  purple600: '#7E68BE',
  purple700: '#6A55A8',

  sky100: '#E6F5FC',
  sky: '#A9DDF4',
  sky600: '#6FBFE3',

  yellow100: '#FFF5D6',
  yellow: '#FFE18A',
  yellow600: '#F8C95A',
  yellow700: '#E9B23C',

  peach100: '#FFEBE5',
  peach: '#FFBBAA',
  peach600: '#F59A86',

  mint100: '#E7F7EF',
  mint: '#B7E7D1',
  mint600: '#7FCFAB',

  green100: '#F1F7E6',
  green: '#D7E8B5',
  green600: '#A9CB7C',

  navy: '#38334F',
  /** Brief value #77718A, darkened to #6C6680 for WCAG AA (≥4.5:1) on all tinted surfaces. */
  greyPurple: '#6C6680',
  greyPurple300: '#B7B2C4',
  white: '#FFFFFF',
} as const;

/** Semantic color roles. */
export const color = {
  background: {
    primary: palette.cream,
    secondary: palette.pink,
    raised: palette.white,
    sunken: palette.cream200,
  },
  text: {
    primary: palette.navy,
    secondary: palette.greyPurple,
    disabled: palette.greyPurple300,
    onPrimary: palette.white,
    onAccent: palette.navy,
  },
  brand: {
    lavender: palette.lavender,
    purple: palette.purple,
    purpleStrong: palette.purple700,
  },
  action: {
    /** Positive / "go" actions (Los geht's, Spielen). */
    accent: palette.yellow,
    accentPressed: palette.yellow600,
    /**
     * Primary navigation / confirm actions (Weiter, Puzzle erstellen).
     * White label on purple is 3.2:1 → only allowed for bold labels ≥ 19px
     * (WCAG "large text"). Small text on purple uses `brand.purpleStrong`.
     */
    primary: palette.purple,
    primaryPressed: palette.purple600,
  },
  feedback: {
    success: palette.mint600,
    successSurface: palette.mint100,
    info: palette.sky600,
    infoSurface: palette.sky100,
    warning: palette.yellow700,
    warningSurface: palette.yellow100,
    /** Never use red/alarm tones with children – errors are gentle peach. */
    gentleError: palette.peach600,
    gentleErrorSurface: palette.peach100,
  },
  /** Tinted card surfaces – one per content category. */
  surface: {
    lavender: palette.lavender100,
    sky: palette.sky100,
    yellow: palette.yellow100,
    peach: palette.peach100,
    mint: palette.mint100,
    green: palette.green100,
    pink: palette.pink,
  },
  border: {
    subtle: 'rgba(56, 51, 79, 0.08)',
    card: 'rgba(255, 255, 255, 0.9)',
    focus: palette.purple,
  },
  /** Navy-tinted shadows – never pure black. */
  shadow: 'rgba(56, 51, 79, 1)',
  scrim: 'rgba(56, 51, 79, 0.35)',
} as const;

/* ------------------------------------------------------------------ */
/* Gradients                                                           */
/* ------------------------------------------------------------------ */

export interface GradientToken {
  readonly colors: readonly [string, string, ...string[]];
  /** Angle in degrees, CSS convention (180 = top → bottom). */
  readonly angle: number;
}

export const gradient = {
  /** Default screen background: warm cream with a soft blush at the bottom. */
  screenWarm: { colors: [palette.cream, palette.cream200, palette.pink], angle: 180 },
  /** Dreamy variant for "promise"/story screens. */
  screenDream: { colors: ['#F7F1FF', palette.pink, palette.cream], angle: 180 },
  /** Gameplay table – calm, low-contrast so pieces stand out. */
  playTable: { colors: [palette.sky100, '#F4F1FF'], angle: 180 },
  buttonAccent: { colors: ['#FFEAA6', palette.yellow, palette.yellow600], angle: 180 },
  buttonPrimary: { colors: ['#B3A0F0', palette.purple, palette.purple600], angle: 180 },
  meadow: { colors: [palette.green, palette.green600], angle: 180 },
  mascotBody: { colors: ['#FFF0B8', palette.yellow, palette.yellow600], angle: 160 },
} as const satisfies Record<string, GradientToken>;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fontFamily = {
  /** Nunito – rounded, friendly, very legible. Only weights 600–900. */
  display: 'Nunito',
  body: 'Nunito',
} as const;

export const fontWeight = {
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export interface TextStyleToken {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: (typeof fontWeight)[keyof typeof fontWeight];
  readonly letterSpacing: number;
}

/** Type scale (dp / px). Minimum body size for children is 16. */
export const typography = {
  hero: { fontSize: 40, lineHeight: 46, fontWeight: '900', letterSpacing: -0.4 },
  title1: { fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.3 },
  title2: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.2 },
  title3: { fontSize: 21, lineHeight: 27, fontWeight: '800', letterSpacing: 0 },
  bodyLarge: { fontSize: 18, lineHeight: 26, fontWeight: '600', letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '600', letterSpacing: 0 },
  button: { fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: 0.1 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: 0.1 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: 0.2 },
} as const satisfies Record<string, TextStyleToken>;

/* ------------------------------------------------------------------ */
/* Spacing, radius, sizing                                             */
/* ------------------------------------------------------------------ */

/** 4-pt grid. */
export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

/** Generous, soft radii – no hard corners anywhere. */
export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  /** Phone-sized sheets / modals. */
  sheet: 36,
  pill: 999,
} as const;

/** Minimum touch targets. Children get more than the platform minimum. */
export const touch = {
  /** Absolute minimum for any tappable element (Apple HIG 44pt). */
  min: 48,
  /** Default for child-facing controls. */
  child: 56,
  /** Primary call-to-action height. */
  cta: 64,
} as const;

export const iconSize = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
  illustration: 72,
} as const;

/* ------------------------------------------------------------------ */
/* Elevation                                                           */
/* ------------------------------------------------------------------ */

export interface ShadowToken {
  readonly offsetY: number;
  readonly blur: number;
  readonly opacity: number;
  /** Android elevation equivalent. */
  readonly elevation: number;
}

/** Soft, navy-tinted, low-opacity shadows. Max. two levels per screen. */
export const shadow = {
  none: { offsetY: 0, blur: 0, opacity: 0, elevation: 0 },
  card: { offsetY: 6, blur: 18, opacity: 0.08, elevation: 3 },
  raised: { offsetY: 10, blur: 28, opacity: 0.12, elevation: 6 },
  /** Piece being dragged in gameplay. */
  lifted: { offsetY: 14, blur: 22, opacity: 0.2, elevation: 10 },
} as const satisfies Record<string, ShadowToken>;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

export const duration = {
  instant: 90,
  fast: 160,
  base: 240,
  gentle: 360,
  slow: 520,
  celebrate: 1400,
} as const;

/** Cubic-bezier control points (x1, y1, x2, y2). */
export const easing = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
  /** Soft overshoot for "boop" feedback (buttons, snapping). */
  playful: [0.34, 1.56, 0.64, 1],
} as const;

export const spring = {
  /** Button press feedback. */
  press: { damping: 15, stiffness: 320, mass: 0.6 },
  /** Piece snapping into place. */
  snap: { damping: 14, stiffness: 260, mass: 0.7 },
  /** Mascot idle bounce – used sparingly, disabled with Reduced Motion. */
  bouncy: { damping: 9, stiffness: 180, mass: 0.8 },
} as const;

export const pressScale = 0.96;

/* ------------------------------------------------------------------ */
/* Aggregate                                                           */
/* ------------------------------------------------------------------ */

export const tokens = {
  palette,
  color,
  gradient,
  fontFamily,
  fontWeight,
  typography,
  spacing,
  radius,
  touch,
  iconSize,
  shadow,
  duration,
  easing,
  spring,
  pressScale,
} as const;

export type Tokens = typeof tokens;
