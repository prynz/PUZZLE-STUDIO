import { SecondaryButton, Text, radius, spacing } from '@puzzle-studio/ui';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n/index';

import { errorMessage, type ProbeResult } from './probes';

interface Preview {
  uri: string;
  width: number;
  height: number;
}

/**
 * Opens the system photo picker (no media permission needed) and creates a
 * 256 px preview with the image manipulator. Nothing is persisted; the
 * preview lives in the cache only.
 */
export function PickerProbe({ onResult }: { onResult: (r: ProbeResult) => void }) {
  const [preview, setPreview] = useState<Preview | null>(null);

  const pick = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, exif: false });
      if (res.canceled) {
        onResult({ status: 'pending', detail: t('check.pickerCanceled') });
        return;
      }
      const asset = res.assets[0];
      if (!asset) return;
      const ref = await ImageManipulator.manipulate(asset.uri).resize({ width: 256 }).renderAsync();
      const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
      setPreview({ uri: out.uri, width: out.width, height: out.height });
      onResult({ status: 'ok', detail: `${asset.width}×${asset.height} → ${out.width}×${out.height}` });
    } catch (e) {
      onResult({ status: 'fail', detail: errorMessage(e) });
    }
  };

  return (
    <View style={styles.wrap}>
      <SecondaryButton testID="picker-probe" label={t('check.pickerButton')} onPress={pick} />
      <Text variant="caption">{t('check.pickerHint')}</Text>
      {preview ? (
        <Image
          source={{ uri: preview.uri }}
          style={[styles.preview, { aspectRatio: preview.width / preview.height }]}
          contentFit="cover"
          accessibilityLabel="Vorschau"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  preview: { width: 128, borderRadius: radius.md },
});
