/**
 * Privacy-safe error description for logs: error name/code and message with every
 * path or URI replaced by "<path>" – never file names, folders or image data
 * (docs/security/privacy.md).
 */
export function describeError(e: unknown): string {
  if (!(e instanceof Error)) return typeof e;
  const code = (e as { code?: unknown }).code; // Expo CodedError carries a string code
  const message = e.message
    .replace(/[a-z][a-z0-9+.-]*:\/\/\S*/gi, '<path>')
    .replace(/(^|[\s"'(=])[~.]?\/\S*/g, '$1<path>')
    .slice(0, 300);
  return `${e.name}${typeof code === 'string' ? ` [${code}]` : ''}: ${message}`;
}
