import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BACKGROUND_LOOKS, FRAME_LOOKS, STICKER_SVGS } from '../illustrations/rewards.ts';
import { radius } from '../tokens.ts';
import { DecorativeBackground } from './DecorativeBackground.tsx';
import { Mascot } from './Mascot.tsx';

/** Small preview of a reward: frame swatch, mini background or sticker. Decorative (label on the parent). */
export function RewardBadge({ id, size = 64 }: { id: string; size?: number }) {
  const frame = FRAME_LOOKS[id];
  const background = BACKGROUND_LOOKS[id];
  const sticker = STICKER_SVGS[id];
  return (
    <View style={[styles.box, { width: size, height: size }]} accessible={false}>
      {frame ? (
        <View style={[styles.frame, { borderColor: frame.outer, backgroundColor: frame.inner }]} />
      ) : background ? (
        <DecorativeBackground preset={background} />
      ) : sticker ? (
        <SvgXml xml={sticker} width={size} height={size} />
      ) : (
        <Mascot emotion="greeting" size={size} accessibilityLabel={null} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  frame: { width: '86%', height: '86%', borderRadius: radius.md, borderWidth: 7 },
});
