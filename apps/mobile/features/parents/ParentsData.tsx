import { ConfirmDialog, SecondaryButton, Section, Text, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';

import { formatBytes } from './storageView';

type Usage = { status: 'loading' } | { status: 'done'; bytes: number | null } | { status: 'failed' };

function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      <Text variant="label" testID={testID}>
        {value}
      </Text>
    </View>
  );
}

/** "Daten": what is stored on this device, where to tidy up, and "delete everything". */
export function ParentsData() {
  const router = useRouter();
  const images = useImages();
  const puzzles = usePuzzles();
  const progress = useProgress();
  const settings = useSettings();
  const [usage, setUsage] = useState<Usage>({ status: 'loading' });
  const [confirm, setConfirm] = useState(false);
  const [wipe, setWipe] = useState<'idle' | 'running' | 'failed'>('idle');
  const { usage: measure } = images;
  const count = images.images.length;

  useEffect(() => {
    let alive = true;
    measure()
      .then((bytes) => alive && setUsage({ status: 'done', bytes }))
      .catch(() => alive && setUsage({ status: 'failed' }));
    return () => {
      alive = false;
    };
  }, [measure, count]);

  const finished = puzzles.puzzles.filter((p) => p.status === 'completed').length;
  const space =
    usage.status === 'loading'
      ? t('parents.data.measuring')
      : usage.status === 'failed'
        ? t('parents.data.unknown')
        : usage.bytes === null
          ? t('parents.data.webOnly')
          : formatBytes(usage.bytes);

  const deleteAll = async () => {
    setWipe('running');
    try {
      // puzzles first (they point to images), then pictures, progress and finally the settings
      await puzzles.clearAll();
      await images.clearAll();
      await progress.clearAll();
      await settings.resetAll();
      setConfirm(false);
      router.replace('/onboarding');
    } catch {
      setWipe('failed');
    }
  };

  return (
    <>
      <Section title={t('parents.data.title')} tone="sky">
        <Row label={t('parents.data.images')} value={String(count)} testID="data-images" />
        <Row label={t('parents.data.puzzles')} value={String(puzzles.puzzles.length)} testID="data-puzzles" />
        <Row label={t('parents.data.finished')} value={String(finished)} />
        <Row label={t('parents.data.space')} value={space} testID="data-space" />
        <Text variant="caption" tone="secondary">
          {t('parents.data.local')}
        </Text>
      </Section>

      <Section title={t('parents.data.tidy')}>
        <Text variant="body">{t('parents.data.tidyHint')}</Text>
        <SecondaryButton
          testID="data-images-manage"
          label={t('parents.data.manageImages')}
          onPress={() => router.push('/create')}
        />
        <SecondaryButton
          testID="data-puzzles-manage"
          label={t('parents.data.managePuzzles')}
          onPress={() => router.push('/collection')}
        />
      </Section>

      <Section title={t('parents.data.wipe')} tone="peach">
        <Text variant="body">{t('parents.data.wipeHint')}</Text>
        {wipe === 'failed' ? (
          <Text variant="label" accessibilityLiveRegion="polite">
            {t('parents.data.wipeFailed')}
          </Text>
        ) : null}
        <SecondaryButton
          testID="data-wipe"
          label={t('parents.data.wipeButton')}
          disabled={wipe === 'running'}
          onPress={() => setConfirm(true)}
        />
      </Section>

      <ConfirmDialog
        visible={confirm}
        title={t('parents.data.confirmTitle')}
        message={t('parents.data.confirmBody')}
        confirmLabel={t('parents.data.confirmYes')}
        cancelLabel={t('parents.data.confirmNo')}
        onConfirm={() => void deleteAll()}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
