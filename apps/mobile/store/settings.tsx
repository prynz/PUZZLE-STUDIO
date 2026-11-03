import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { MotionProvider } from '@puzzle-studio/ui';

import { createPersistentSettingsStore } from '@/storage/settingsPersistence';
import type { SettingsStore } from '@/storage/settingsStore';

/** Play-help profile – drives interaction complexity, independent of piece count (docs/product/gameplay-concept.md §2). */
export type PlayProfile = 'toddler' | 'kid' | 'pro';
export const PLAY_PROFILES: readonly PlayProfile[] = ['toddler', 'kid', 'pro'];
export const DEFAULT_PROFILE: PlayProfile = 'kid';

export interface Settings {
  onboardingCompleted: boolean;
  profile: PlayProfile;
  /** Chosen reward ids (validated against unlocks where they are used). */
  boardBackground: string | null;
  cardFrame: string | null;
  /** Parents' options (Phase 7). */
  parent: ParentOptions;
}

/** What parents can set (docs/product/parents-area.md). */
export interface ParentOptions {
  /** Misplaced pieces: follow the profile, or force "glide aside" / "back to the tray" (not for toddlers). */
  misplace: 'profile' | 'nudge' | 'return';
  /** Faint reference picture under the board when a puzzle starts. */
  reference: boolean;
  /** Pino offers a hint by himself after a while without progress. */
  hintOffers: boolean;
  /** Less motion in the whole app (adds to the system setting). */
  reduceMotion: boolean;
}

export const DEFAULT_PARENT_OPTIONS: ParentOptions = {
  misplace: 'profile',
  reference: true,
  hintOffers: true,
  reduceMotion: false,
};

const KEYS = {
  onboarding: 'onboarding.completed',
  profile: 'play.profile',
  boardBackground: 'reward.background',
  cardFrame: 'reward.frame',
  parent: 'parent.options',
} as const;

function parseParent(raw: unknown): ParentOptions {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PARENT_OPTIONS;
  const r = raw as Record<string, unknown>; // validated field by field below
  const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  return {
    misplace: r.misplace === 'nudge' || r.misplace === 'return' ? r.misplace : 'profile',
    reference: bool(r.reference, DEFAULT_PARENT_OPTIONS.reference),
    hintOffers: bool(r.hintOffers, DEFAULT_PARENT_OPTIONS.hintOffers),
    reduceMotion: bool(r.reduceMotion, DEFAULT_PARENT_OPTIONS.reduceMotion),
  };
}

const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : null);

const isProfile = (v: unknown): v is PlayProfile =>
  typeof v === 'string' && (PLAY_PROFILES as readonly string[]).includes(v);

export function parseSettings(raw: Record<string, unknown>): Settings {
  const profile = raw[KEYS.profile];
  return {
    onboardingCompleted: raw[KEYS.onboarding] === true,
    profile: isProfile(profile) ? profile : DEFAULT_PROFILE,
    boardBackground: str(raw[KEYS.boardBackground]),
    cardFrame: str(raw[KEYS.cardFrame]),
    parent: parseParent(raw[KEYS.parent]),
  };
}

interface SettingsContextValue {
  ready: boolean;
  settings: Settings;
  setProfile: (p: PlayProfile) => Promise<void>;
  completeOnboarding: (p: PlayProfile) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  /** Apply a reward (null = default look). */
  setReward: (kind: 'boardBackground' | 'cardFrame', id: string | null) => Promise<void>;
  setParentOption: <K extends keyof ParentOptions>(key: K, value: ParentOptions[K]) => Promise<void>;
  /** Back to the very first start (after "delete all data"). */
  resetAll: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children, store }: { children: ReactNode; store?: SettingsStore }) {
  const [backend] = useState(() => store ?? createPersistentSettingsStore());
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => parseSettings({}));

  useEffect(() => {
    let alive = true;
    backend
      .getAll()
      .then((raw) => alive && setSettings(parseSettings(raw)))
      .catch(() => {
        // Storage unavailable: keep defaults, the app stays usable.
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [backend]);

  const setProfile = useCallback(
    async (p: PlayProfile) => {
      setSettings((s) => ({ ...s, profile: p }));
      await backend.set(KEYS.profile, p);
    },
    [backend],
  );
  const completeOnboarding = useCallback(
    async (p: PlayProfile) => {
      setSettings((s) => ({ ...s, onboardingCompleted: true, profile: p }));
      await backend.set(KEYS.profile, p);
      await backend.set(KEYS.onboarding, true);
    },
    [backend],
  );
  const resetOnboarding = useCallback(async () => {
    setSettings((s) => ({ ...s, onboardingCompleted: false }));
    await backend.remove(KEYS.onboarding);
  }, [backend]);

  const setReward = useCallback(
    async (kind: 'boardBackground' | 'cardFrame', id: string | null) => {
      setSettings((s) => ({ ...s, [kind]: id }));
      if (id) await backend.set(KEYS[kind], id);
      else await backend.remove(KEYS[kind]);
    },
    [backend],
  );

  const setParentOption = useCallback(
    async <K extends keyof ParentOptions>(key: K, value: ParentOptions[K]) => {
      const next: ParentOptions = { ...settings.parent, [key]: value };
      setSettings((s) => ({ ...s, parent: next }));
      await backend.set(KEYS.parent, next);
    },
    [backend, settings.parent],
  );
  const resetAll = useCallback(async () => {
    await Promise.all(Object.values(KEYS).map((k) => backend.remove(k)));
    setSettings(parseSettings({}));
  }, [backend]);

  const value = useMemo(
    () => ({ ready, settings, setProfile, completeOnboarding, resetOnboarding, setReward, setParentOption, resetAll }),
    [ready, settings, setProfile, completeOnboarding, resetOnboarding, setReward, setParentOption, resetAll],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

/** Applies the parents' "Bewegung reduzieren" to every animated ui component. */
export function MotionFromSettings({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return <MotionProvider reduceMotion={settings.parent.reduceMotion}>{children}</MotionProvider>;
}
