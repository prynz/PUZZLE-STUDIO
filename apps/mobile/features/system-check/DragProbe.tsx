import { color, radius, spacing, spring } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** A draggable piece: verifies Gesture Handler + Reanimated on the UI thread. */
export function DragProbe({ onDragged }: { onDragged: () => void }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lifted = useSharedValue(1);

  const pan = usePanGesture({
    onActivate: () => {
      'worklet';
      lifted.value = withSpring(1.08, spring.press);
    },
    onUpdate: (e) => {
      'worklet';
      tx.value = e.translationX;
      ty.value = e.translationY;
    },
    onDeactivate: () => {
      'worklet';
      tx.value = withSpring(0, spring.snap);
      ty.value = withSpring(0, spring.snap);
      lifted.value = withSpring(1, spring.press);
      scheduleOnRN(onDragged);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: lifted.value }],
  }));

  return (
    <View style={styles.track}>
      <GestureDetector gesture={pan}>
        <Animated.View testID="drag-probe" style={[styles.piece, style]} accessibilityRole="adjustable">
          <View style={styles.knob} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 96,
    borderRadius: radius.md,
    backgroundColor: color.surface.sky,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    padding: spacing.sm,
  },
  piece: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: color.brand.soft,
    alignItems: 'center',
  },
  knob: {
    position: 'absolute',
    top: -12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: color.brand.soft,
  },
});
