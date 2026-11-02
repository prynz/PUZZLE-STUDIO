import { Icon, IconButton, ImageTile, Screen, Text, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { loadSample } from '@/services/imageSources';
import { useImages } from '@/store/images';

import { SAMPLES } from './samples';

/** Bundled sample pictures – work offline, no permission needed. */
export function SamplesScreen() {
  const router = useRouter();
  const { setPending } = useImages();
  const [failed, setFailed] = useState(false);

  const choose = async (module: number) => {
    try {
      setPending(await loadSample(module));
      router.push('/creator/crop');
    } catch {
      setFailed(true);
    }
  };

  return (
    <Screen scroll decor="sky" contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('crop.back')} icon={<Icon name="back" />} onPress={() => router.back()} />
        <Text variant="title1" accessibilityRole="header">
          {t('samples.title')}
        </Text>
      </View>
      {failed ? <Text variant="body">{t('creator.failed')}</Text> : null}
      <View style={styles.grid}>
        {SAMPLES.map((s) => (
          <Pressable
            key={s.id}
            testID={`sample-${s.id}`}
            accessibilityRole="button"
            accessibilityLabel={t(s.labelKey)}
            onPress={() => choose(s.module)}
            style={styles.cell}
          >
            <ImageTile source={s.module} aspect={4 / 3} accessibilityLabel={t(s.labelKey)} />
            <Text variant="label" align="center" style={styles.label}>
              {t(s.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%' },
  label: { marginTop: spacing.xs },
});
