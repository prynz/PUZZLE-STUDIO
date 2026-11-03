import { t } from '@/i18n';
import { keepDataOutOfBackups } from '@/services/backupExclusion';

import type { ProbeResult } from './probes';

/** Shows that photos and play data stay out of automatic cloud backups on this device. */
export async function probeBackup(): Promise<ProbeResult> {
  switch (await keepDataOutOfBackups()) {
    case 'excluded':
      return { status: 'ok', detail: t('check.backupIos') };
    case 'off-by-config':
      return { status: 'ok', detail: t('check.backupAndroid') };
    case 'not-applicable':
      return { status: 'unsupported', detail: t('check.backupWeb') };
    case 'failed':
      return { status: 'fail', detail: t('check.backupFailed') };
  }
}
