import { Screen, SecondaryButton, Text, spacing, type Status } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n/index';
import { loadSkia } from '@/services/skiaLoader';

import { CheckRow } from './CheckRow';
import { DragProbe } from './DragProbe';
import { PickerProbe } from './PickerProbe';
import { probeFonts, probePlatform, type ProbeResult } from './probes';
import { probeFileSystem, probeSqlite } from './storageProbes';

// Skia must not be imported before CanvasKit is loaded on web → lazy module.
const SkiaProbe = lazy(async () => {
  await loadSkia();
  const m = await import('./SkiaProbe');
  return { default: m.SkiaProbe };
});

const pending: ProbeResult = { status: 'pending', detail: '' };

export function SystemCheckScreen() {
  const router = useRouter();
  const [sqlite, setSqlite] = useState<ProbeResult>(pending);
  const [fs, setFs] = useState<ProbeResult>(pending);
  const [skia, setSkia] = useState<Status>('pending');
  const [dragged, setDragged] = useState(false);
  const [picker, setPicker] = useState<ProbeResult>(pending);
  const platform = probePlatform();
  const fonts = probeFonts();

  useEffect(() => {
    let alive = true;
    probeSqlite().then((r) => alive && setSqlite(r));
    probeFileSystem().then((r) => alive && setFs(r));
    return () => {
      alive = false;
    };
  }, []);

  const onSkiaReady = useCallback(() => setSkia('ok'), []);
  const onDragged = useCallback(() => setDragged(true), []);

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text variant="title1" accessibilityRole="header">
        {t('check.title')}
      </Text>
      <Text variant="body">{t('check.intro')}</Text>

      <View style={styles.list}>
        <CheckRow
          testID="check-platform"
          title={t('check.platform')}
          status={platform.status}
          detail={platform.detail}
        />
        <CheckRow testID="check-fonts" title={t('check.fonts')} status={fonts.status} detail={fonts.detail} />
        <CheckRow testID="check-sqlite" title={t('check.sqlite')} status={sqlite.status} detail={sqlite.detail} />
        <CheckRow testID="check-fs" title={t('check.fs')} status={fs.status} detail={fs.detail} />
        <CheckRow testID="check-skia" title={t('check.skia')} status={skia}>
          <Suspense fallback={null}>
            <SkiaProbe onReady={onSkiaReady} />
          </Suspense>
        </CheckRow>
        <CheckRow
          testID="check-gesture"
          title={t('check.gesture')}
          status={dragged ? 'ok' : 'pending'}
          detail={dragged ? t('check.gestureDone') : t('check.gestureHint')}
        >
          <DragProbe onDragged={onDragged} />
        </CheckRow>
        <CheckRow testID="check-picker" title={t('check.picker')} status={picker.status} detail={picker.detail}>
          <PickerProbe onResult={setPicker} />
        </CheckRow>
      </View>

      <SecondaryButton testID="check-back" label={t('check.back')} onPress={() => router.back()} style={styles.back} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm },
  list: { gap: spacing.sm, marginTop: spacing.sm },
  back: { marginTop: spacing.lg, alignSelf: 'center' },
});
