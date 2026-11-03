/** Web preview: nothing is stored on a disk that could be backed up. */
export type BackupState = 'excluded' | 'off-by-config' | 'failed' | 'not-applicable';

export async function keepDataOutOfBackups(): Promise<BackupState> {
  return 'not-applicable';
}
