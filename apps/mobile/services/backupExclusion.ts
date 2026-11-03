import { Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { BackupExclusion } from '@/modules/backup-exclusion';

/**
 * Children's photos and play data never go into automatic cloud backups
 * (docs/security/privacy.md – "Backup-Verhalten"):
 *  - iOS: the whole Documents folder (images/ + SQLite/) is marked "exclude from backup".
 *  - Android: switched off in app.config.ts (`allowBackup: false`, checked in CI).
 */
export type BackupState = 'excluded' | 'off-by-config' | 'failed' | 'not-applicable';

export async function keepDataOutOfBackups(): Promise<BackupState> {
  if (Platform.OS === 'android') return 'off-by-config';
  if (!BackupExclusion) return 'failed'; // the native module must be part of every iOS build
  try {
    return (await BackupExclusion.excludeFromBackup(Paths.document.uri)) ? 'excluded' : 'failed';
  } catch {
    return 'failed';
  }
}
