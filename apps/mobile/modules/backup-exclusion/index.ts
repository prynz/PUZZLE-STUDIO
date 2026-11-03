import { requireOptionalNativeModule } from 'expo';

interface BackupExclusionModule {
  /** Marks the folder as "do not back up" and reports whether it worked. */
  excludeFromBackup(uri: string): Promise<boolean>;
}

/** iOS only (local Expo module, see ios/). null on Android, web and in Jest. */
export const BackupExclusion = requireOptionalNativeModule<BackupExclusionModule>('BackupExclusion');
