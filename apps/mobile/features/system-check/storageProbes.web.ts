import type { ProbeResult } from './probes';

// Web is a preview/review target only. Local storage of photos and the SQLite
// database are verified on iOS/Android (expo-sqlite web needs extra wasm +
// cross-origin isolation headers that we deliberately do not set up).
const unsupported: ProbeResult = { status: 'unsupported', detail: 'Wird auf iOS/Android geprüft' };

export async function probeSqlite(): Promise<ProbeResult> {
  return unsupported;
}

export async function probeFileSystem(): Promise<ProbeResult> {
  return unsupported;
}
