import { describeError } from '@/utils/errors';

describe('describeError', () => {
  it('keeps name, code and message but strips URIs and paths', () => {
    const e = Object.assign(new Error('Unable to copy file:///data/user/0/app/cache/IMG_4711.jpg to /data/x/y.jpg'), {
      code: 'ERR_FILE_COPY',
    });
    const s = describeError(e);
    expect(s).toBe('Error [ERR_FILE_COPY]: Unable to copy <path> to <path>');
    expect(s).not.toContain('IMG_4711');
  });

  it('handles non-errors', () => {
    expect(describeError('x')).toBe('string');
  });
});
