import { createContext, useContext, type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

const AppReduceMotion = createContext(false);

/** App-level "Bewegung reduzieren" (parents' setting) – adds to the system setting. */
export function MotionProvider({ reduceMotion, children }: { reduceMotion: boolean; children: ReactNode }) {
  return <AppReduceMotion.Provider value={reduceMotion}>{children}</AppReduceMotion.Provider>;
}

/** True when the system OR the parents ask for less motion. Use this instead of Reanimated's hook. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const app = useContext(AppReduceMotion);
  return system || app;
}
