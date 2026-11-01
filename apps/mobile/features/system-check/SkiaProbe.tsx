import { Canvas, Circle, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import { gradient, palette } from '@puzzle-studio/ui';
import { useEffect } from 'react';

/** Renders a small Skia scene. Only imported after `loadSkia()` (see SystemCheckScreen). */
export function SkiaProbe({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <Canvas style={{ width: 160, height: 72 }} accessibilityLabel="Skia-Testgrafik">
      <RoundedRect x={0} y={0} width={160} height={72} r={20}>
        <LinearGradient start={vec(0, 0)} end={vec(160, 72)} colors={[...gradient.buttonPrimary.colors]} />
      </RoundedRect>
      <Circle cx={40} cy={36} r={18} color={palette.yellow} />
      <Circle cx={80} cy={36} r={12} color={palette.mint} />
      <Circle cx={112} cy={36} r={8} color={palette.peach} />
    </Canvas>
  );
}
