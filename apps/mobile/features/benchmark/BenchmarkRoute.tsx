import { Screen, SecondaryButton, Surface, Text, radius, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { Suspense, lazy, useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { t } from '@/i18n/index';
import { loadSkia } from '@/services/skiaLoader';

import type { BenchmarkStats } from './BenchmarkCanvas';

const BenchmarkCanvas = lazy(async () => {
  await loadSkia();
  const m = await import('./BenchmarkCanvas');
  return { default: m.BenchmarkCanvas };
});

const fmt = (v: number | undefined, digits = 0) => (v === undefined ? '–' : v.toFixed(digits));

function Stat({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title3" testID={testID}>
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

export function BenchmarkRoute() {
  const router = useRouter();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [seed, setSeed] = useState(1);
  const [stats, setStats] = useState<Partial<BenchmarkStats>>({});
  const onStats = useCallback((u: Partial<BenchmarkStats>) => setStats((s) => ({ ...s, ...u })), []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s && Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
  };

  return (
    <Screen background="table" contentStyle={styles.content}>
      <View style={styles.header}>
        <SecondaryButton size="compact" label={t('check.back')} onPress={() => router.back()} />
        <Text variant="title3" accessibilityRole="header">
          {t('bench.title')}
        </Text>
      </View>
      <Text variant="caption">{t('bench.intro')}</Text>
      <Surface style={styles.stats}>
        <Stat label={t('bench.pieces')} value={fmt(stats.pieces)} testID="bench-pieces" />
        <Stat label={t('bench.build')} value={fmt(stats.buildMs)} />
        <Stat label={t('bench.hit')} value={fmt(stats.hitUs, 1)} testID="bench-hit" />
        <Stat label={t('bench.fps')} value={fmt(stats.fps)} testID="bench-fps" />
        <Stat label={`${t('bench.minFps')} ${t('bench.fps')}`} value={fmt(stats.minFps)} />
        <Stat label={t('bench.moves')} value={fmt(stats.moves ?? 0)} testID="bench-moves" />
      </Surface>
      <View style={styles.area} onLayout={onLayout}>
        {size ? (
          <Suspense fallback={<Text variant="body">{t('bench.loading')}</Text>}>
            <BenchmarkCanvas
              key={`${seed}-${size.w}x${size.h}`}
              width={size.w}
              height={size.h}
              seed={seed}
              onStats={onStats}
            />
          </Suspense>
        ) : null}
      </View>
      <SecondaryButton label={t('bench.shuffle')} onPress={() => setSeed((s) => s + 1)} style={styles.shuffle} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  stat: { alignItems: 'center', flex: 1 },
  area: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  shuffle: { alignSelf: 'center' },
});
