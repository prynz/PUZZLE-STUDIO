import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { Platform } from 'react-native';

import type { Status } from '@puzzle-studio/ui';
import { fontFace } from '@puzzle-studio/ui';

export interface ProbeResult {
  status: Status;
  detail: string;
}

const isNewArchitecture = (): boolean => 'nativeFabricUIManager' in globalThis;

export function probePlatform(): ProbeResult {
  const sdk = Constants.expoConfig?.sdkVersion ?? '?';
  const variant = String(Constants.expoConfig?.extra?.['variant'] ?? 'unbekannt');
  const arch = Platform.OS === 'web' ? 'Web' : isNewArchitecture() ? 'New Architecture' : 'Legacy Architecture';
  return {
    status: Platform.OS === 'web' || isNewArchitecture() ? 'ok' : 'fail',
    detail: `${Platform.OS} ${String(Platform.Version ?? '')} · Expo SDK ${sdk} · ${arch} · ${variant}`,
  };
}

export function probeFonts(): ProbeResult {
  const faces = Object.values(fontFace);
  const loaded = faces.filter((f) => Font.isLoaded(f));
  return {
    status: loaded.length === faces.length ? 'ok' : 'fail',
    detail: `${loaded.length}/${faces.length} Schnitte geladen`,
  };
}

export const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));
