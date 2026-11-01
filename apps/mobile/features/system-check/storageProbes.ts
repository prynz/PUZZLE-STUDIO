import { File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import { errorMessage, type ProbeResult } from './probes';

/** Opens an in-memory database and runs a real query. */
export async function probeSqlite(): Promise<ProbeResult> {
  try {
    const db = await SQLite.openDatabaseAsync(':memory:');
    const row = await db.getFirstAsync<{ v: string }>('SELECT sqlite_version() AS v');
    await db.closeAsync();
    return { status: 'ok', detail: `SQLite ${row?.v ?? '?'}` };
  } catch (e) {
    return { status: 'fail', detail: errorMessage(e) };
  }
}

/** Writes, reads and deletes a small file in the app cache. */
export async function probeFileSystem(): Promise<ProbeResult> {
  try {
    const file = new File(Paths.cache, 'system-check.txt');
    file.create({ overwrite: true });
    file.write('puzzle-studio');
    const content = await file.text();
    file.delete();
    return content === 'puzzle-studio'
      ? { status: 'ok', detail: 'Schreiben, Lesen, Löschen im App-Cache' }
      : { status: 'fail', detail: 'Inhalt stimmt nicht überein' };
  } catch (e) {
    return { status: 'fail', detail: errorMessage(e) };
  }
}
