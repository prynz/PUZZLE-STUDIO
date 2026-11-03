import { Platform } from 'react-native';

import { keepDataOutOfBackups } from '@/services/backupExclusion';

const mockExclude = jest.fn<Promise<boolean>, [string]>();
jest.mock('@/modules/backup-exclusion', () => ({
  BackupExclusion: { excludeFromBackup: (uri: string) => mockExclude(uri) },
}));
jest.mock('expo-file-system', () => ({ Paths: { document: { uri: 'file:///app/Documents/' } } }));

describe('backup exclusion', () => {
  const os = Platform.OS;
  afterEach(() => {
    Platform.OS = os;
    mockExclude.mockReset();
  });

  it('iOS: marks the whole Documents folder (images + database) as not backed up', async () => {
    Platform.OS = 'ios';
    mockExclude.mockResolvedValue(true);
    expect(await keepDataOutOfBackups()).toBe('excluded');
    expect(mockExclude).toHaveBeenCalledWith('file:///app/Documents/');
  });

  it('iOS: reports a failure instead of hiding it', async () => {
    Platform.OS = 'ios';
    mockExclude.mockRejectedValue(new Error('denied'));
    expect(await keepDataOutOfBackups()).toBe('failed');
    mockExclude.mockResolvedValue(false);
    expect(await keepDataOutOfBackups()).toBe('failed');
  });

  it('Android: off by app configuration, no native call', async () => {
    Platform.OS = 'android';
    expect(await keepDataOutOfBackups()).toBe('off-by-config');
    expect(mockExclude).not.toHaveBeenCalled();
  });
});
