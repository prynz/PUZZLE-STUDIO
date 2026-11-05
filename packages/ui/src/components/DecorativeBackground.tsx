import { useMemo, useState } from 'react';
import { Image, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BACKGROUND_ART, coverLayout } from '../illustrations/backgroundArt.ts';
import { backgroundSvg, type BackgroundPreset } from '../illustrations/backgrounds.ts';

export type { BackgroundPreset };

/**
 * Illustration layer behind screen content (clouds, stars, meadow …).
 * Never interactive, never announced by screen readers.
 */
export function DecorativeBackground({ preset }: { preset: BackgroundPreset }) {
  const art = BACKGROUND_ART[preset];
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
      {art !== undefined ? (
        size ? (
          // exactly one picture, sized and placed by us (no tiling, no intrinsic size on web)
          <Image
            source={art.source}
            style={[styles.art, coverLayout(art, size.w, size.h)]}
            resizeMode="stretch"
            accessible={false}
          />
        ) : null
      ) : xml && size ? (
        <SvgXml xml={xml} width={size.w} height={size.h} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ art: { position: 'absolute' } });
