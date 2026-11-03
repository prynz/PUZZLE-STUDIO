import { de, type MessageKey } from './de';

/** Minimal typed translation helper – no runtime dependency needed for the MVP. */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const text: string = de[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}

export type { MessageKey };

/** "1 Stern" / "3 Sterne" – the only plural the app needs so far. */
export function starsText(n: number): string {
  return t(n === 1 ? 'stars.one' : 'stars.other', { n });
}
