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
  /** Screen backgrounds: cool, soft grey-green (style of the PO concept art, 2026-11-04). */
  mist: '#F1F5F3',
  mist200: '#E4ECE8',
  mist300: '#D3E0DA',
  pink: '#F9EAF0',
  pink300: '#F3D3E0',

  /** Brand scale lime → green → teal, like Pino (was lavender/purple until 2026-11-04). */
  leaf100: '#EEF6E2',
  leaf200: '#DCEFC2',
  leaf: '#9BD86A',
  leaf600: '#3BAA79',
  leaf700: '#1F7F62',
  /** Deep teal-green for the main buttons ("Los geht's") and small brand text. */
  forest: '#123E33',
  /** Pino's lime and teal, and the neon-lime glow used for highlights. */
  lime: '#D4EE3F',
  teal: '#1E8A6C',
  neon: '#C7F03A',

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

  /** Text: green-tinted near-black and grey (≥ 4.5:1 on every surface, tested). */
  ink: '#14261E',
  slate: '#53635B',
  slate300: '#B3C0BA',
  white: '#FFFFFF',
} as const;

/** Semantic color roles. */
export const color = {
  background: {
    primary: palette.mist,
    secondary: palette.mist200,
    raised: palette.white,
    sunken: palette.mist200,
  },
  text: {
    primary: palette.ink,
    secondary: palette.slate,
    disabled: palette.slate300,
    onPrimary: palette.white,
    onAccent: palette.white,
  },
  brand: {
    /** Light brand green (rings, dots, soft accents). */
    soft: palette.leaf,
    /** Main brand green (tab bubble, highlights). */
    main: palette.leaf600,
    /** Small text in brand color – deep green, AA on every surface. */
    strong: palette.forest,
  },
  action: {
    /** Main "go" actions (Los geht's, Spielen): deep glossy green, white label (≈ 10:1). */
    accent: palette.forest,
    accentPressed: '#0D2E26',
    /** Confirm / continue actions (Weiter): green, white label (≈ 4.9:1, AA for all sizes). */
    primary: palette.leaf700,
    primaryPressed: '#186A51',
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
    leaf: palette.leaf100,
    sky: palette.sky100,
    yellow: palette.yellow100,
    peach: palette.peach100,
    mint: palette.mint100,
    green: palette.green100,
    pink: palette.pink,
  },
  /** On/off controls (switches): state colors meet WCAG 1.4.11 (≥ 3:1) on every surface. */
  control: {
    on: palette.leaf700,
    off: palette.slate,
    knobOn: palette.white,
  },
  border: {
    subtle: 'rgba(20, 38, 30, 0.08)',
    card: 'rgba(255, 255, 255, 0.9)',
    focus: palette.leaf600,
  },
  /** Green-tinted shadows – never pure black. */
  shadow: 'rgba(20, 38, 30, 1)',
  scrim: 'rgba(20, 38, 30, 0.35)',
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
  /** Default screen background: cool soft grey-green, a touch deeper at the bottom. */
  screenWarm: { colors: ['#F5F8F6', palette.mist, palette.mist200], angle: 180 },
  /** Dreamy variant for "promise"/story screens: a faint lime glow at the top. */
  screenDream: { colors: ['#F3F8E6', '#EDF3EF', palette.mist], angle: 180 },
  /** Gameplay table – calm, low-contrast so pieces stand out. */
  playTable: { colors: ['#EEF4F1', '#F7FAF8'], angle: 180 },
  /** Glossy deep teal-green pill (top light, bottom deep). */
  buttonAccent: { colors: ['#2A5E50', palette.forest, '#0B2A22'], angle: 180 },
  buttonPrimary: { colors: ['#248468', palette.leaf700, '#186A51'], angle: 180 },
  /** Pino's signature: lime → green → teal (big hero cards, tab bubble). */
  brand: { colors: [palette.lime, '#8FD162', '#4DB97D'], angle: 135 },
  brandDeep: { colors: [palette.lime, '#4DB97D', palette.teal], angle: 135 },
  meadow: { colors: [palette.green, palette.green600], angle: 180 },
  /** Story cards on the start screen (dark text on all stops). */
  storySky: { colors: [palette.sky100, palette.sky], angle: 150 },
  storySun: { colors: [palette.yellow100, palette.peach], angle: 150 },
  mascotBody: { colors: ['#E2F55A', '#4DB97D', palette.teal], angle: 160 },
} as const satisfies Record<string, GradientToken>;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fontFamily = {
  /** Nunito – rounded, friendly, very legible. Only weights 600–900. */
  display: 'Nunito',
  body: 'Nunito',
} as const;

/**
 * Native font face names per weight (as registered via @expo-google-fonts/nunito).
 * React Native cannot synthesize weights for custom fonts, so the `Text`
 * component maps `fontWeight` → `fontFace` instead of using `fontWeight`.
 */
export const fontFace = {
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
  '800': 'Nunito_800ExtraBold',
  '900': 'Nunito_900Black',
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
/** Screen rhythm: space between separated sections and inside them. */
export const layout = {
  sectionGap: 20,
  /** Gap between items inside a section. */
  itemGap: 12,
} as const;

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

/** Soft, green-tinted, low-opacity shadows. Max. two levels per screen. */
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
  /** Bottom bar bubble gliding to the chosen tab – soft, with a small overshoot. */
  glide: { damping: 15, stiffness: 170, mass: 0.9 },
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
  fontFace,
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
