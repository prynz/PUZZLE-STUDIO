import { de, type MessageKey } from './de';

/** Minimal typed translation helper – no runtime dependency needed for the MVP. */
export function t(key: MessageKey): string {
  return de[key];
}

export type { MessageKey };
