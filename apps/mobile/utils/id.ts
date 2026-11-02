/** Random, non-guessable-enough local id (not a security token). Never derived from user file names. */
export function createId(): string {
  const rnd = Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `${Date.now().toString(36)}-${rnd}`;
}
