import { useState, type ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type LayoutChangeEvent } from 'react-native';

import { shadowStyle } from '../styles/helpers.ts';
import { color, radius, shadow, spacing } from '../tokens.ts';

export interface ImageTileProps {
  source: ImageSourcePropType;
  /** Width / height of the picture. */
  aspect: number;
  accessibilityLabel: string;
  /** Optional overlay action (e.g. delete button) in the top-right corner. */
  action?: ReactNode;
  testID?: string;
}

/**
 * Picture card with white rim (collection, "Meine Bilder").
 * Height is computed from the measured width (aspectRatio + % width is unreliable on web).
 */
export function ImageTile({ source, aspect, accessibilityLabel, action, testID }: ImageTileProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  return (
    <View style={[styles.card, shadowStyle(shadow.card)]} testID={testID}>
      <View style={[styles.imageBox, { height: width > 0 ? width / aspect : undefined }]} onLayout={onLayout}>
        {width > 0 ? (
          <Image
            source={source}
            resizeMode="cover"
            style={{ width, height: width / aspect }}
            accessibilityLabel={accessibilityLabel}
            accessible
          />
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: color.background.raised,
    padding: spacing.xs,
  },
  imageBox: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.background.sunken, minHeight: 40 },
  action: { position: 'absolute', top: spacing.sm, right: spacing.sm },
});
