import { clampPan, coverScale, rotatedSize, type Rotation, type Size } from '@puzzle-studio/image-processing';
import { color, radius } from '@puzzle-studio/ui';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

export const MAX_ZOOM = 4;

export interface CropViewState {
  /** Zoom factor on top of the cover scale (1 … MAX_ZOOM). */
  zoom: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
}

interface Props {
  uri: string;
  /** Original pixel size (unrotated). */
  original: Size;
  rotation: Rotation;
  frame: Size;
  state: CropViewState;
}

/**
 * Fixed crop frame with the picture underneath. Pan moves, pinch zooms;
 * the picture always covers the frame (clampPan). Runs on the UI thread.
 */
export function CropView({ uri, original, rotation, frame, state }: Props) {
  const rotated = rotatedSize(original, rotation);
  const cover = coverScale(rotated, frame);
  // container = rotated picture at cover scale; inner = unrotated picture, rotated by transform
  const contW = rotated.width * cover;
  const contH = rotated.height * cover;
  const innerW = original.width * cover;
  const innerH = original.height * cover;
  const { zoom, tx, ty } = state;
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startZoom = useSharedValue(1);

  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      startX.value = tx.get();
      startY.value = ty.get();
    },
    onUpdate: (e) => {
      'worklet';
      const p = clampPan(
        rotated,
        frame,
        cover * zoom.get(),
        startX.value + e.translationX,
        startY.value + e.translationY,
      );
      tx.set(p.tx);
      ty.set(p.ty);
    },
  });
  const pinch = usePinchGesture({
    onBegin: () => {
      'worklet';
      startZoom.value = zoom.get();
    },
    onUpdate: (e) => {
      'worklet';
      zoom.set(Math.min(MAX_ZOOM, Math.max(1, startZoom.value * e.scale)));
      const p = clampPan(rotated, frame, cover * zoom.get(), tx.get(), ty.get());
      tx.set(p.tx);
      ty.set(p.ty);
    },
  });
  const gestures = useSimultaneousGestures(pan, pinch);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: zoom.get() }],
  }));

  return (
    <GestureDetector gesture={gestures}>
      <View style={[styles.frame, { width: frame.width, height: frame.height }]} testID="crop-frame">
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: contW,
              height: contH,
              left: (frame.width - contW) / 2,
              top: (frame.height - contH) / 2,
            },
            style,
          ]}
        >
          <Image
            source={{ uri }}
            contentFit="fill"
            accessibilityIgnoresInvertColors
            style={{
              position: 'absolute',
              width: innerW,
              height: innerH,
              left: (contW - innerW) / 2,
              top: (contH - innerH) / 2,
              transform: [{ rotate: `${rotation}deg` }],
            }}
          />
        </Animated.View>
        <View pointerEvents="none" style={styles.rim} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: radius.lg, backgroundColor: color.background.sunken },
  rim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: color.border.card,
  },
});
