import { StatusPill, Surface, Text, spacing, type Status } from '@puzzle-studio/ui';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n/index';

const statusLabel: Record<Status, string> = {
  ok: t('check.status.ok'),
  fail: t('check.status.fail'),
  pending: t('check.status.pending'),
  unsupported: t('check.status.unsupported'),
};

export interface CheckRowProps {
  title: string;
  status: Status;
  detail?: string;
  children?: ReactNode;
  testID?: string;
}

export function CheckRow({ title, status, detail, children, testID }: CheckRowProps) {
  return (
    <Surface style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text variant="label" style={styles.title}>
          {title}
        </Text>
        <StatusPill status={status} label={statusLabel[status]} />
      </View>
      {detail ? (
        <Text variant="caption" style={styles.detail}>
          {detail}
        </Text>
      ) : null}
      {children ? <View style={styles.extra}>{children}</View> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xxs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1 },
  detail: { marginTop: spacing.xxs },
  extra: { marginTop: spacing.sm },
});
