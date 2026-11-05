import {
  ASPECTS,
  coverScale,
  cropFromView,
  frameFor,
  nextRotation,
  rotatedSize,
  type AspectKey,
  type Rotation,
  type Size,
} from '@puzzle-studio/image-processing';
import { Chip, Icon, IconButton, LoadingState, PrimaryButton, Screen, Surface, Text, spacing } from '@puzzle-studio/ui';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { t } from '@/i18n';
import { deriveImages } from '@/services/imagePipeline';
import { useImages } from '@/store/images';
import { describeError } from '@/utils/errors';

import { CropView, MAX_ZOOM } from './CropView';

const ASPECT_LABEL = { landscape: 'crop.landscape', square: 'crop.square', portrait: 'crop.portrait' } as const;

/** Step 2 of the creator: choose format, move/zoom/rotate. The original stays untouched. */
export function CropScreen() {
  const router = useRouter();
  const { pending, setPending, add } = useImages();
  const [aspect, setAspect] = useState<AspectKey>('landscape');
  const [rotation, setRotation] = useState<Rotation>(0);
  const [area, setArea] = useState<Size | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const zoom = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  if (!pending) return <Redirect href="/create" />;

  const reset = () => {
    zoom.set(1);
    tx.set(0);
    ty.set(0);
  };
  const frame = area ? frameFor(ASPECTS[aspect], area) : null;
  const original = { width: pending.width, height: pending.height };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((a) => (a && Math.abs(a.width - width) < 1 && Math.abs(a.height - height) < 1 ? a : { width, height }));
  };

  const changeZoom = (factor: number) => {
    const z = Math.min(MAX_ZOOM, Math.max(1, zoom.get() * factor));
    zoom.set(withTiming(z));
    if (z === 1) {
      tx.set(withTiming(0));
      ty.set(withTiming(0));
    }
  };

  const confirm = async () => {
    if (!frame) return;
    setBusy(true);
    setFailed(false);
    let stage: 'derive' | 'store' = 'derive';
    const t0 = Date.now();
    try {
      const rotated = rotatedSize(original, rotation);
      const scale = coverScale(rotated, frame) * zoom.get();
      const crop = cropFromView(rotated, frame, scale, tx.get(), ty.get());
      const derived = await deriveImages(pending.uri, original, rotation, crop);
      stage = 'store';
      const t1 = Date.now();
      await add({
        sourceUri: pending.uri,
        sourceKind: pending.kind,
        extension: pending.extension,
        width: pending.width,
        height: pending.height,
        rotation,
        crop,
        derived,
      });
      // Durations only – helps to spot slow devices (no paths, no image data).
      console.info(`[image-save] ok derive=${t1 - t0}ms store=${Date.now() - t1}ms`);
      setPending(null);
      router.dismissTo('/create');
    } catch (e) {
      // Visible to the child as a friendly message; the log carries no paths or image data.
      console.warn(`[image-save] ${stage} failed: ${describeError(e)}`);
      setFailed(true);
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <Screen background="dream">
        <View style={styles.center}>
          <LoadingState testID="crop-busy" message={t('crop.working')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      background="table"
      contentStyle={styles.content}
      footer={
        <PrimaryButton
          testID="crop-confirm"
          variant="primary"
          label={t('crop.confirm')}
          onPress={confirm}
          disabled={!frame}
        />
      }
    >
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('crop.back')} icon={<Icon name="back" />} onPress={() => router.back()} />
        <Text variant="title3" accessibilityRole="header">
          {t('crop.title')}
        </Text>
      </View>

      <View style={styles.area} onLayout={onLayout}>
        {frame ? (
          <CropView
            key={`${aspect}-${rotation}`}
            uri={pending.uri}
            original={original}
            rotation={rotation}
            frame={frame}
            state={{ zoom, tx, ty }}
          />
        ) : null}
      </View>

      <View style={styles.row} accessibilityRole="radiogroup">
        {(Object.keys(ASPECTS) as AspectKey[]).map((k) => (
          <Chip
            key={k}
            testID={`aspect-${k}`}
            label={t(ASPECT_LABEL[k])}
            selected={aspect === k}
            onPress={() => {
              setAspect(k);
              reset();
            }}
          />
        ))}
      </View>
      <View style={styles.row}>
        <IconButton
          testID="crop-zoom-out"
          accessibilityLabel={t('crop.zoomOut')}
          icon={<Icon name="minus" />}
          onPress={() => changeZoom(1 / 1.25)}
        />
        <IconButton
          testID="crop-zoom-in"
          accessibilityLabel={t('crop.zoomIn')}
          icon={<Icon name="plus" />}
          onPress={() => changeZoom(1.25)}
        />
        <IconButton
          testID="crop-rotate"
          accessibilityLabel={t('crop.rotate')}
          icon={<Icon name="rotate" />}
          onPress={() => {
            setRotation((r) => nextRotation(r));
            reset();
          }}
        />
      </View>
      <Text variant="caption" align="center">
        {t('crop.hint')}
      </Text>
      {failed ? (
        <Surface tone="peach" accessibilityLiveRegion="polite">
          <Text variant="body">{t('crop.failed')}</Text>
        </Surface>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  center: { flex: 1, justifyContent: 'center' },
});
