import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { backgroundSvg, type BackgroundPreset } from '../illustrations/backgrounds.ts';

export type { BackgroundPreset };

/**
 * Illustration layer behind screen content (clouds, stars, meadow …).
 * Never interactive, never announced by screen readers.
 */
export function DecorativeBackground({ preset }: { preset: BackgroundPreset }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const xml = useMemo(() => (size ? backgroundSvg(preset, size.w, size.h) : ''), [preset, size]);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) =>
      s && s.w === Math.round(width) && s.h === Math.round(height)
        ? s
        : { w: Math.round(width), h: Math.round(height) },
    );
  };
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      onLayout={onLayout}
    >
      {xml && size ? <SvgXml xml={xml} width={size.w} height={size.h} /> : null}
    </View>
  );
}
