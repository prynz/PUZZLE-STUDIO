import { de } from '@/i18n/de';
import { t } from '@/i18n/index';

describe('i18n', () => {
  it('has no empty strings', () => {
    for (const [key, value] of Object.entries(de)) {
      expect(value.trim()).not.toHaveLength(0);
      expect(t(key as keyof typeof de)).toBe(value);
    }
  });
});
